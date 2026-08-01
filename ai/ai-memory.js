/* =========================================
   EMerriment AI Memory Engine
========================================= */

const AIMemory = {

    /* =====================================
       SAVE MEMORY
    ===================================== */

    async save(key, value, importance = 1) {

        const {
            data: { user }
        } = await supabase.auth.getUser();

        if (!user) return false;

        const { error } = await supabase

            .from("ai_memory")

            .upsert({

                user_id: user.id,

                memory_key: key,

                memory_value: value,

                importance,

                updated_at: new Date().toISOString()

            }, {

                onConflict: "user_id,memory_key"

            });

        if (error) {

            console.error("Memory Save Error:", error);

            return false;

        }

        return true;

    },



    /* =====================================
       LOAD ALL MEMORY
    ===================================== */

    async loadAll() {

        const {
            data: { user }
        } = await supabase.auth.getUser();

        if (!user) return {};

        const { data, error } = await supabase

            .from("ai_memory")

            .select("*")

            .eq("user_id", user.id)

            .order("importance", {

                ascending: false

            });

        if (error) {

            console.error(error);

            return {};

        }

        const memory = {};

        data.forEach(item => {

            memory[item.memory_key] =
                item.memory_value;

        });

        return memory;

    },



    /* =====================================
       LOAD ONE MEMORY
    ===================================== */

    async get(key) {

        const memory =
            await this.loadAll();

        return memory[key] || null;

    },



    /* =====================================
       DELETE MEMORY
    ===================================== */

    async remove(key) {

        const {
            data: { user }
        } = await supabase.auth.getUser();

        if (!user) return;

        await supabase

            .from("ai_memory")

            .delete()

            .eq("user_id", user.id)

            .eq("memory_key", key);

    },



    /* =====================================
       BUILD AI CONTEXT
    ===================================== */

    async buildContext() {

        const memory =
            await this.loadAll();

        return {

            skinType:
                memory.skinType || null,

            concern:
                memory.concern || null,

            sensitivity:
                memory.sensitivity || null,

            skinScore:
                memory.skinScore || null,

            goal:
                memory.goal || null,

            preferredIngredients:
                memory.ingredients || null,

            routinePreference:
                memory.routine || null

        };

    },



    /* =====================================
       SAVE SKIN PROFILE
    ===================================== */

    async rememberSkinProfile(profile) {

        if (!profile) return;

        if (profile.skinType)

            await this.save(
                "skinType",
                profile.skinType,
                5
            );

        if (profile.concern)

            await this.save(
                "concern",
                profile.concern,
                5
            );

        if (profile.sensitivity)

            await this.save(
                "sensitivity",
                profile.sensitivity,
                5
            );

        if (profile.skinScore)

            await this.save(
                "skinScore",
                profile.skinScore,
                4
            );

    },



    /* =====================================
       SAVE USER GOAL
    ===================================== */

    async rememberGoal(goal) {

        await this.save(

            "goal",

            goal,

            5

        );

    },



    /* =====================================
       SAVE INGREDIENT PREFERENCE
    ===================================== */

    async rememberIngredient(name) {

        await this.save(

            "ingredients",

            name,

            3

        );

    },



    /* =====================================
       SAVE ROUTINE STYLE
    ===================================== */

    async rememberRoutine(style) {

        await this.save(

            "routine",

            style,

            3

        );

    }

};