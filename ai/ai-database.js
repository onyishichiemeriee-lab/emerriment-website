/* =========================================
   EMerriment AI Database
   Supabase Functions
========================================= */

let currentConversationId = null;

/* =========================================
   CREATE NEW CONVERSATION
========================================= */

async function createConversation(title = "New Conversation") {

    const {
        data: { user }
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
        .from("ai_conversations")
        .insert({
            user_id: user.id,
            title
        })
        .select()
        .single();

    if (error) {
        console.error("Create conversation:", error);
        return null;
    }

    currentConversationId = data.id;

    return data.id;
}

/* =========================================
   SAVE MESSAGE
========================================= */

async function saveMessage(role, content) {

    if (!currentConversationId) {

        await createConversation();

    }

    const {
        data: { user }
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
        .from("ai_messages")
        .insert({
            conversation_id: currentConversationId,
            user_id: user.id,
            role,
            content
        });

    if (error) {

        console.error("Save message:", error);

    }

}

/* =========================================
   LOAD USER CONVERSATIONS
========================================= */

async function loadConversations() {

    const {
        data: { user }
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase

        .from("ai_conversations")

        .select("*")

        .eq("user_id", user.id)

        .order("updated_at", {

            ascending: false

        });

    if (error) {

        console.error(error);

        return [];

    }

    return data;

}

/* =========================================
   LOAD MESSAGES
========================================= */

async function loadMessages(conversationId) {

    currentConversationId = conversationId;

    const { data, error } = await supabase

        .from("ai_messages")

        .select("*")

        .eq("conversation_id", conversationId)

        .order("created_at", {

            ascending: true

        });

    if (error) {

        console.error(error);

        return [];

    }

    return data;

}

/* =========================================
   UPDATE CONVERSATION TITLE
========================================= */

async function updateConversationTitle(title) {

    if (!currentConversationId) return;

    await supabase

        .from("ai_conversations")

        .update({

            title,
            updated_at: new Date().toISOString()

        })

        .eq("id", currentConversationId);

}

/* =========================================
   DELETE CONVERSATION
========================================= */

async function deleteConversation(conversationId) {

    const { error } = await supabase

        .from("ai_conversations")

        .delete()

        .eq("id", conversationId);

    if (error) {

        console.error(error);

    }

}

/* =========================================
   START NEW CHAT
========================================= */

async function startNewChat() {

    currentConversationId = null;

    return await createConversation();

}

async function getConversationHistory() {

    return await loadConversations();

}

async function renameConversation(id, title) {

    await supabase

        .from("ai_conversations")

        .update({

            title

        })

        .eq("id", id);

}

async function updateLastMessage(text) {

    if (!currentConversationId) return;

    await supabase

        .from("ai_conversations")

        .update({

            last_message: text,

            updated_at: new Date().toISOString()

        })

        .eq("id", currentConversationId);

}

await updateLastMessage(content);

async function pinConversation(id, pinned = true) {

    await supabase

        .from("ai_conversations")

        .update({

            is_pinned: pinned

        })

        .eq("id", id);

}

async function archiveConversation(id) {

    await supabase

        .from("ai_conversations")

        .update({

            archived: true

        })

        .eq("id", id);

}