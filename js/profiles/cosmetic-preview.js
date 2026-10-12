/* Preview one slot without changing the saved profile or other equipped slots. */
window.glossixPreviewProfile=function(profile,item){
 const fields={avatar:'avatar_id',banner:'banner_id',design:'design_id','avatar-border':'border_id',leaderboard:'leaderboard_design'};
 const copy={...profile};
 if(item&&fields[item.kind])copy[fields[item.kind]]=item.cosmetic_id;
 return copy;
};
