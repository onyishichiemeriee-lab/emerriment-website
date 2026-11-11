/* =========================================
   EMerriment AI Memory Engine
========================================= */

"use strict";


const AIMemory = {


    /* =====================================
       GET SUPABASE CLIENT
    ===================================== */

    getClient() {

        const client =
            window.supabaseClient;

        if (!client) {

            console.error(
                "AIMemory: Supabase client is not available."
            );

            return null;

        }

        return client;

    },


    /* =====================================
       GET CURRENT USER
    ===================================== */

    async getCurrentUser() {

        const supabase =
            this.getClient();

        if (!supabase) return null;

        const {
            data,
            error
        } = await supabase.auth.getUser();

        if (error) {

            console.warn(
                "AIMemory authentication warning:",
                error
            );

            return null;

        }

        return data.user || null;

    },


    /* =====================================
       SAVE MEMORY
    ===================================== */

  async save(
    key,
    value,
    importance = 1
) {

    // Validate memory input before any database operation.
    if (
        typeof key !== "string" ||
        typeof value !== "string" ||
        !key.trim() ||
        !value.trim()
    ) {
        console.warn("🛡️ Invalid memory rejected.");
        return false;
    }

    key = key.trim();
    value = value.trim();

    // Reject temporary skin reactions associated with product use.
    const mentionsSkinReaction =
        /\b(burning|burn|irritated|irritation|redness|swelling|swollen|rash|itching|itchy|stinging|blistering|hives|allergic reaction)\b/i
            .test(value);

    const mentionsRecentProductUse =
        /\b(after|since|from)\b/i.test(value) &&
        /\b(using|use|applying|applied|trying|tried|serum|cream|moisturizer|moisturiser|sunscreen|cleanser|skincare product)\b/i
            .test(value);

    if (mentionsSkinReaction && mentionsRecentProductUse) {
        console.warn(
            "🛡️ Temporary product-reaction memory rejected."
        );
        return false;
    }

    // Do not store reaction-related descriptions as permanent skin type.
    if (
        key.toLowerCase() === "skintype" &&
        /\b(sensitive|irritated|irritation|red|redness|swollen|swelling|burning|stinging|rash|itchy|itching|allergic|reaction|reacting)\b/i
            .test(value)
    ) {
        console.warn(
            "🛡️ Reaction-related skin type memory rejected."
        );
        return false;
    }

    const supabase =
        this.getClient();

        if (!supabase) return false;


        const user =
            await this.getCurrentUser();

        if (!user) {

            console.warn(
                "AIMemory: No authenticated user."
            );

            return false;

        }


        const {
            error
        } = await supabase

            .from("ai_memory")

            .upsert({

                user_id:
                    user.id,

                memory_key:
                    key,

                memory_value:
                    value,

                importance,

                updated_at:
                    new Date().toISOString()

            }, {

                onConflict:
                    "user_id,memory_key"

            });


        if (error) {

            console.error(
                "AIMemory Save Error:",
                error
            );

            return false;

        }


        return true;

    },


    /* =====================================
       LOAD ALL MEMORY
    ===================================== */

    async loadAll() {

        const supabase =
            this.getClient();

        if (!supabase) return {};


        const user =
            await this.getCurrentUser();

        if (!user) return {};


        const {
            data,
            error
        } = await supabase

            .from("ai_memory")

            .select("*")

            .eq(
                "user_id",
                user.id
            )

            .order(
                "importance",
                {
                    ascending: false
                }
            );


        if (error) {

            console.error(
                "AIMemory Load Error:",
                error
            );

            return {};

        }


        const memory = {};


        (data || []).forEach(
            item => {

                memory[
                    item.memory_key
                ] = item.memory_value;

            }
        );


        return memory;

    },


    /* =====================================
       LOAD ONE MEMORY
    ===================================== */

    async get(key) {

        const memory =
            await this.loadAll();

        return (
            memory[key] ?? null
        );

    },


    /* =====================================
       DELETE MEMORY
    ===================================== */

    async remove(key) {

        const supabase =
            this.getClient();

        if (!supabase) return false;


        const user =
            await this.getCurrentUser();

        if (!user) return false;


        const {
            error
        } = await supabase

            .from("ai_memory")

            .delete()

            .eq(
                "user_id",
                user.id
            )

            .eq(
                "memory_key",
                key
            );


        if (error) {

            console.error(
                "AIMemory Remove Error:",
                error
            );

            return false;

        }


        return true;

    },


    /* =====================================
       BUILD AI MEMORY CONTEXT
    ===================================== */

    async buildContext() {

        const memory =
            await this.loadAll();


        return {
    ...memory,

    skinType: memory.skinType ?? null,
    concern: memory.concern ?? null,
    sensitivity: memory.sensitivity ?? null,
    skinScore: memory.skinScore ?? null,
    goal: memory.goal ?? null,
    preferredIngredients: memory.ingredients ?? null,
    routinePreference: memory.routine ?? null
};

    },


    /* =====================================
       SAVE SKIN PROFILE
    ===================================== */

    async rememberSkinProfile(profile) {

    if (!profile) return;

    if (profile.skinType) {
        await this.save(
            "skinType",
            profile.skinType,
            5
        );
    }

    if (profile.concern) {
        await this.save(
            "concern",
            profile.concern,
            5
        );
    }

    if (profile.oilLevel) {
        await this.save(
            "oilLevel",
            profile.oilLevel,
            4
        );
    }

    if (profile.sensitivity) {
        await this.save(
            "sensitivity",
            profile.sensitivity,
            5
        );
    }

    if (
        profile.score !== undefined &&
        profile.score !== null
    ) {
        await this.save(
            "skinScore",
            profile.score,
            4
        );
    }

},


    /* =====================================
       SAVE USER GOAL
    ===================================== */

    async rememberGoal(
        goal
    ) {

        if (!goal) return;


        return await this.save(
            "goal",
            goal,
            5
        );

    },

async rememberConversation(
    key,
    value,
    importance = 2
) {

    if (!key || !value) return;

    return await this.save(
        `conversation_${key}`,
        value,
        importance
    );

},

shouldRemember(message) {

    if (!message || typeof message !== "string") {
        return false;
    }

    const text = message.trim();

    if (!text) {
        return false;
    }

    const lower = text.toLowerCase();

    // Never automatically remember temporary skin reactions.
const mentionsSkinReaction =
    /\b(burning|burn|irritated|irritation|redness|swelling|swollen|rash|itching|itchy|stinging|blistering|hives|allergic reaction)\b/i
        .test(text);

const mentionsRecentProductUse =
    /\b(after|since|from)\b/i.test(text) &&
    /\b(using|use|applying|applied|trying|tried|serum|cream|moisturizer|moisturiser|sunscreen|cleanser|skincare product)\b/i.test(text);

if (mentionsSkinReaction && mentionsRecentProductUse) {
    return false;
}

    /* -----------------------------------------
       EXPLICIT MEMORY REQUESTS
    ----------------------------------------- */

    if (
        lower.includes("remember that") ||
        lower.includes("please remember") ||
        lower.startsWith("remember ")
    ) {
        return true;
    }


    /* -----------------------------------------
       QUESTIONS SHOULD NOT BECOME MEMORIES
    ----------------------------------------- */

    if (
        text.endsWith("?") ||
        /^(what|why|when|where|who|which|how|can|could|should|would|is|are|do|does|did)\b/i.test(lower)
    ) {
        return false;
    }


    /* -----------------------------------------
       LONG-TERM PERSONAL SIGNALS
    ----------------------------------------- */

    const memoryPatterns = [

        /^i prefer\b/i,
        /^i like\b/i,
        /^i don't like\b/i,
        /^i dislike\b/i,
        /^i always\b/i,
        /^i usually\b/i,
        /^i want to\b/i,
        /^my goal is\b/i,
        /^i'm trying to\b/i,
        /^i am trying to\b/i,
        /^i use\b/i,
        /^i avoid\b/i,
        /^i'm struggling with\b/i,
 /^i am struggling with\b/i,
        /^i'm looking for\b/i,
        /^i am looking for\b/i,
        /^i'm dealing with\b/i,
        /^i am dealing with\b/i,
        /^i've been struggling with\b/i,
    ];


    return memoryPatterns.some(pattern =>
        pattern.test(text)
    );
},

extractMemory(message) {

    if (!this.shouldRemember(message)) {
        return null;
    }

    const text = message.trim();

    const patterns = [
        { signal: "my skin is", key: "skinType" },
       { signal: "my dry skin", key: "skinType", fixedValue: "dry" },
    { signal: "i've been struggling with", key: "concern" },
    { signal: "i prefer", key: "preference" },
    { signal: "i like", key: "preference" },
    { signal: "i don't like", key: "dislike" },
    { signal: "i dislike", key: "dislike" },
    { signal: "my goal is", key: "goal" },
    { signal: "i want to", key: "goal" },
    { signal: "i want", key: "goal" },
    { signal: "i'm trying to", key: "goal" },
    { signal: "i am trying to", key: "goal" },
    { signal: "i avoid", key: "avoid" },
    { signal: "i use", key: "routine" }
];

    const lowerText = text.toLowerCase();
    const memories = [];

    for (const pattern of patterns) {

        const index = lowerText.indexOf(pattern.signal);

        if (index !== -1) {

            let value = text
                .slice(index + pattern.signal.length)
                .trim();

            if (pattern.fixedValue) {
                memories.push({
                    key: pattern.key,
                    value: pattern.fixedValue,
                    importance: 3
                });

                continue;
            }

            value = value
                .replace(/^[,:-]\s*/, "")
                .replace(/[.!?]+$/, "")
                .trim();

            if (pattern.key === "concern") {
                value = value
                    .split(/\band\s+i\s+want\b/i)[0]
                    .trim();
            }

            if (pattern.key === "skinType") {
                value = value
                    .split(/\band\b/i)[0]
                    .trim();
            }

            if (pattern.key === "goal") {
                value = value
                    .split(/\bfor my\b/i)[0]
                    .trim();
            }

            value = value
                .split(/\b(?:but|however|although)\b/i)[0]
                .trim()
                .replace(/[,:-]+$/, "")
                .trim();

            if (!value) {
                continue;
            }

            memories.push({ key: pattern.key, value, importance: 3 });
        }
    }

    return memories.length ? memories : null;
},



async saveExtractedMemory(memory) {

    if (!memory || !memory.key || !memory.value) {
        return false;
    }

    const key = String(memory.key).trim().toLowerCase();
    const value = String(memory.value).trim();

    if (!key || !value) {
        return false;
    }

    // Do not save temporary product-reaction descriptions
    // as long-term memories under any memory key.
    const mentionsSkinReaction =
        /\b(burning|burn|irritated|irritation|redness|swelling|swollen|rash|itching|itchy|stinging|blistering|hives|allergic reaction)\b/i
            .test(value);

    const mentionsRecentProductUse =
        /\b(after|since|from)\b/i.test(value) &&
        /\b(using|use|applying|applied|trying|tried|serum|cream|moisturizer|moisturiser|sunscreen|cleanser|skincare product)\b/i
            .test(value);

    if (mentionsSkinReaction && mentionsRecentProductUse) {
        console.warn(
            "🛡️ Temporary product-reaction memory rejected."
        );

        return false;
    }

    // Do not infer permanent skin type from reaction-related
    // or uncertain descriptions.
    if (
        key === "skintype" &&
        /\b(sensitive|irritated|irritation|red|redness|swollen|swelling|burning|stinging|rash|itchy|itching|allergic|reaction|reacting)\b/i
            .test(value)
    ) {
        console.warn(
            "🛡️ Temporary or reaction-related skin description not saved as skin type."
        );

        return false;
    }

    return await this.save(
        memory.key,
        value,
        memory.importance
    );
},

async processMessage(message) {
    if (!message || typeof message !== "string") return null;

    if (!this.shouldRemember(message)) return null;

    const memories = this.extractMemory(message);

    if (!Array.isArray(memories) || !memories.length) {
        return null;
    }

    const results = [];

    for (const memory of memories) {
        const saved = await this.saveExtractedMemory(memory);

        results.push({
            ...memory,
            saved
        });
    }

    return results;
},

    /* =====================================
       SAVE INGREDIENT PREFERENCE
    ===================================== */

    async rememberIngredient(
        name
    ) {

        if (!name) return;


        return await this.save(
            "ingredients",
            name,
            3
        );

    },


    /* =====================================
       SAVE ROUTINE STYLE
    ===================================== */

    async rememberRoutine(
        style
    ) {

        if (!style) return;


        return await this.save(
            "routine",
            style,
            3
        );

    }

};


/* =========================================
   GLOBAL EXPORT
========================================= */

window.AIMemory =
    AIMemory;


console.log(
    "✅ EMerriment AI Memory Engine initialized."
);