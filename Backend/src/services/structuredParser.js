const { GoogleGenAI, Type } = require("@google/genai")
const { z } = require("zod")

const env = require("../config/env")

const ai = env.geminiApiKey ? new GoogleGenAI({ apiKey: env.geminiApiKey }) : null;

const linkSchema = {
    type: Type.OBJECT,
    required: ["label", "url"],
    properties: {
        label: { type: Type.STRING },
        url: { type: Type.STRING },
    },
}

const responseSchema = {
    type: Type.OBJECT,
    required: [
        "basics",
        "summary",
        "experience",
        "education",
        "skills",
        "projects",
        "certifications",
        "languages",
        "interests"
    ],
    properties: {
        basics: {
            type: Type.OBJECT,
            required: ["name", "title", "locations", "email", "phone", "links"],
            properties: {
                name: { type: Type.STRING },
                title: { type: Type.STRING },
                locations: { type: Type.ARRAY, items: { type: Type.STRING } },
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                links: { type: Type.ARRAY, items: linkSchema }
            }
        },
        summary: { type: Type.STRING },
        experience: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                required: ["company", "role", "period", "bullets"],
                properties: {
                    company: { type: Type.STRING },
                    role: { type: Type.STRING },
                    period: { type: Type.STRING },
                    bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
            },
        },
        education: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                required: ["degree", "school", "period"],
                properties: {
                    degree: { type: Type.STRING },
                    school: { type: Type.STRING },
                    period: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    location: { type: Type.STRING },
                    details: { type: Type.STRING }
                },
            }
        },
        skills: { type: Type.ARRAY, items: { type: Type.STRING } },
        projects: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                required: ["name", "description"],
                properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    tech: { type: Type.ARRAY, items: { type: Type.STRING } },
                    link: { type: Type.STRING }
                },
            },
        },
        certifications: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                required: ["name"],
                properties: {
                    name: { type: Type.STRING },
                    issuer: { type: Type.STRING },
                    year: { type: Type.STRING }
                }
            }
        },
        languages: { type: Type.ARRAY, items: { type: Type.STRING } },
        interests: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
}

//
const validator = z.object({
    basics: z.object({
        name: z.string().default(""),
        title: z.string().default(""),
        locations: z.array(z.string()).default([]),
        email: z.string().default(""),
        phone: z.string().default(""),
        links: z.array(z.object({
            label: z.string(),
            url: z.string()
        })).default([])
    }).transform(val => ({
        name: val.name,
        title: val.title,
        location: val.locations[0] || "",
        email: val.email,
        phone: val.phone,
        links: val.links
    })),
    summary: z.string().default(""),
    experience: z.array(z.object({
        company: z.string().default(""),
        role: z.string().default(""),
        period: z.string().default(""),
        bullets: z.array(z.string()).default([])
    })).default([]),
    education: z.array(z.object({
        degree: z.string().default(""),
        school: z.string().default(""),
        period: z.string().default(""),
        location: z.string().default(""),
        details: z.string().default("")
    })).default([]),
    skills: z.array(z.string()).default([]),
    projects: z.array(z.object({
        name: z.string().default(""),
        description: z.string().default(""),
        tech: z.array(z.string()).default([]),
        link: z.string().default("")
    })).default([]),
    certifications: z.array(z.object({
        name: z.string().default(""),
        issuer: z.string().default(""),
        year: z.string().default("")
    })).default([]),
    languages: z.array(z.string()).default([]),
    interests: z.array(z.string()).default([])
}).transform(val => ({
    basics: val.basics,
    summary: val.summary,
    experiences: val.experience,
    education: val.education.map(e => ({
        degree: e.degree,
        school: e.school,
        period: e.period,
        location: e.location,
        details: e.details || e.summary
    })),
    skills: val.skills,
    projects: val.projects.map(p => ({
        name: p.name,
        description: p.description,
        tech: p.tech || [],
        links: p.link ? [p.link] : []
    })),
    certifications: val.certifications,
    languages: val.languages,
    interests: val.interests
}));
//

function buildPrompt(rawText) {
    return [
        "You are a resume parser. The input is text extracted from a PDF Lines may be jumbled or out of natural reading order.",
        "",
        "Extract structured data:",
        "-basics: name, professional title, location, email, phone, social links (LinkedIn / GitHub / portfolio etc.; label like \"LinkedIn\", full URL)",
        "-summary: the professional summary paragraph (rejoin if split across lines)",
        "-experience: jobs most recent first, with company, role, period (preserve original date format), location if available, and bullet points",
        "-education: degree, school, period, location, optional details",
        "-skills: flat array of technical skills",
        "-projects: name, one-sentence description, optional tech tags, optional Links",
        "-certifications: name, issuer, year",
        "-languages: flat array",
        "-interests: flat array",
        "Rules:",
        "-Be conservative: omit fields that are not clearly present. Use empty strings/arrays where missing.",
        "-Do not invent or paraphrase - extract verbatim where possible.",
        "-Each experience bullet should read as a complete sentence.",
        "-Preserve original date formats (e.g. 'Jan 2022 - Dec 2023')",
        "",
        "RESUME TEXT:",
        "----------",
        rawText,
        "----------",
    ].join("\n");
}

const EMPTY = {
    basics: { name: "", title: "", locations: "", email: "", phone: "", links: [] },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
    interests: []
}

async function parseResume(rawText) {
    if (!ai || !rawText?.trim()) return EMPTY;

    const prompt = buildPrompt(rawText);

    for (let attempt = 1; attempt <= 2; attempt++) {
        try {
            const result = await ai.models.generateContent({
                model: env.geminiModel,
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                config: {
                    responseMimeType: "application/json",
                    responseSchema,
                    temperature: 0.1,
                },
            });

            const text = typeof result.text === "function" ? result.text() : result.text;
            if (!text) throw new Error("Empty response");
            const parsed = JSON.parse(text);
            return validator.parse(parsed);
        } catch (err) {
            if (attempt === 2) {
                console.error("Structured parse failed:", err.message);
                return EMPTY;
            }
        }
    }
    return EMPTY;
}

module.exports = { parseResume }