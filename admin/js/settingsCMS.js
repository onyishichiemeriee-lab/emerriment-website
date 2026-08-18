const supabaseClient = window.supabaseClient;

const form = document.getElementById("settingsForm");
const message = document.getElementById("message");

// ----------------------
// Check Admin
// ----------------------

async function checkAdmin(){

const { data:{ user } } =
await supabaseClient.auth.getUser();

if(!user){

location.href="loginCMS.html";

return;

}

const { data:profile } =
await supabaseClient

.from("profiles")

.select("is_admin")

.eq("id",user.id)

.maybeSingle();

loadSettings();

}

// ----------------------
// Load Settings
// ----------------------

async function loadSettings(){

const { data,error }=

await supabaseClient

.from("website_settings")

.select("*")

.limit(1)

.maybeSingle();

if(error){

console.log("No settings yet.");

return;

}

// If there is an error or no data is returned, exit early
if (error || !data) {
  console.log("No settings found.");
  return;
}

Object.keys(data).forEach(key=>{

const field=document.getElementById(key);

if(!field) return;

if(Array.isArray(data[key])){

field.value=data[key].join(", ");

}else{

field.value=data[key]??"";

}

});

}

// ----------------------
// Save Settings
// ----------------------

form.addEventListener("submit",async(e)=>{

e.preventDefault();

const settings={

site_name:site_name.value,

tagline:tagline.value,

hero_title:hero_title.value,

hero_subtitle:hero_subtitle.value,

hero_button_text:hero_button_text.value,

hero_button_link:hero_button_link.value,

homepage_banner:homepage_banner.value,

contact_email:contact_email.value,

contact_phone:contact_phone.value,

address:address.value,

facebook:facebook.value,

instagram:instagram.value,

tiktok:tiktok.value,

youtube:youtube.value,

x:x.value,

primary_color:primary_color.value,

secondary_color:secondary_color.value,

footer_text:footer_text.value,

seo_title:seo_title.value,

seo_description:seo_description.value,

seo_keywords:seo_keywords.value

.split(",")

.map(item=>item.trim())

.filter(Boolean),

updated_at:new Date().toISOString()

};

const { data }=

await supabaseClient

.from("website_settings")

.select("id")

.limit(1);

let error;

if(data && data.length){

({ error }=await supabase

.from("website_settings")

.update(settings)

.eq("id",data[0].id));

}else{

({ error }=await supabase

.from("website_settings")

.insert(settings));

}

if(error){

message.style.color="red";

message.textContent=error.message;

return;

}

message.style.color="green";

message.textContent="✅ Website settings saved successfully.";

});

// Logout
// ----------------------
logoutBtn.addEventListener("click", async () => {
  // Check if supabase exists before calling methods to prevent crashes
  if (supabase && supabaseClient.auth) {
    await supabaseClient.auth.signOut();
    location.href = "loginCMS.html";
  } else {
    console.error("Supabase client is not initialized.");
  }
});