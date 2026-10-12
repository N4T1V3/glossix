window.glossixShopArt=function(item,avatarUrl,profile={}){
 const safe=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
 if(item.kind==='banner')return '<span class="shop-banner-header banner-'+item.cosmetic_id+'"></span>';
 if(item.kind==='leaderboard')return '<span class="shop-listing-row board-design-'+item.cosmetic_id+'"><span class="shop-listing-rank">'+safe(profile.rank_position?String(profile.rank_position)+([,'st','nd','rd'][profile.rank_position%100>10&&profile.rank_position%100<14?0:profile.rank_position%10]||'th'):'—')+'</span><span class="shop-listing-player">'+(profile.avatarMarkup||'<img src="'+avatarUrl+'" alt="Your avatar">')+'<strong>@'+safe(profile.username||'yourname')+'</strong></span><span>'+safe(profile.account_level??profile.level??'—')+'</span><span>'+safe(profile.weekly_points??'—')+'</span></span>';
 const image='<img src="'+item.image+'" alt="'+item.name+' design">';
 if(item.kind==='avatar-border')return '<span class="shop-frame-preview" data-border="'+item.cosmetic_id+'"><img class="shop-frame-avatar" src="'+avatarUrl+'" alt="Your avatar"><img class="shop-frame-overlay" src="'+item.image+'" alt="'+item.name+' border"></span>';
 if(item.kind==='design')return '<span class="shop-profile-preview shop-preview-'+item.cosmetic_id+'" aria-label="'+safe(item.name)+' artwork"></span>';
 return image;
};
