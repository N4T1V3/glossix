/* Authenticated coin shop; prices and ownership always come from the server. */
(()=>{
 const kinds={avatar:'Avatars',banner:'Profile banners',leaderboard:'Leaderboard designs',design:'Profile backgrounds','avatar-border':'Avatar borders'};
 let serial=0,stock=[],wallet=null,equipped=null,filter='avatar',busy=false,selected=null,boardRow=null;
 const art=id=>GLOSSIX_SHOP_ITEMS.find(i=>i.item_id===id);
 // Register artwork so owned shop cosmetics render everywhere using existing app helpers.
 for(const i of GLOSSIX_SHOP_ITEMS){
  if(i.kind==='avatar'){const a={id:i.cosmetic_id,name:i.name,image:i.image,category:'Shop collection'};avatarMap.set(a.id,a);avatarOptions.push(a);}
  if(i.kind==='banner')bannerThemes.push({id:i.cosmetic_id,name:i.name,level:1000000000});
  if(i.kind==='design')profileDesigns.push({id:i.cosmetic_id,name:i.name,level:1000000000});
  if(i.kind==='leaderboard')leaderboardThemes.push({id:i.cosmetic_id,name:i.name,level:1000000000});
 }
 const oldAvatar=profileAvatar;
 profileAvatar=function(p){const i=GLOSSIX_SHOP_ITEMS.find(i=>i.kind==='avatar-border'&&i.cosmetic_id===p.border_id);if(!i)return oldAvatar(p);return '<span class="shop-frame-preview profile-equipped-frame" data-border="'+i.cosmetic_id+'"><span class="shop-frame-avatar">'+avatarImage(p.avatar_id)+'</span><img class="shop-frame-overlay" src="'+i.image+'" alt="'+esc(i.name)+' border"></span>';};
 const oldRow=leaderboardRowClass;leaderboardRowClass=p=>GLOSSIX_SHOP_ITEMS.some(i=>i.kind==='leaderboard'&&i.cosmetic_id===p.leaderboard_design)?'board-design board-design-'+p.leaderboard_design:oldRow(p);
 function shopLeaderboard(i,profile){
  const row={...(boardRow||{}),...profile,user_id:equipped.user_id||GlossixOnline.user()?.id,account_level:boardRow?.account_level??equipped.level??'—',rank_position:boardRow?.rank_position??'—',points:boardRow?.points??'—',leaderboard_design:i.cosmetic_id,is_you:true};
  const markup=compactBoardRow(row).replace(/<button\b[^>]*class="board-person plain"[^>]*>/g,'<span class="board-person plain">').replace(/<\/button>/g,'</span>');
  return '<table class="board-table compact-board-table shop-real-board"><colgroup><col style="width:9%"><col style="width:57%"><col style="width:17%"><col style="width:17%"></colgroup><tbody>'+markup+'</tbody></table>';
 }
 function view(){const host=document.querySelector('#coin-shop');if(!host)return;
  const collection=(stock.some(i=>i.available)?'':'<p role="status">Browse and preview the collection. Purchases will be available after the shop database update.</p>')+'<p>Permanent cosmetics. Buy once, then equip whenever you like.</p><nav class="shop-filters">'+Object.entries(kinds).map(([k,n])=>'<button data-shop-filter="'+k+'">'+n+'</button>').join('')+'</nav>'+Object.keys(kinds).filter(k=>filter==='all'||k===filter).map(k=>'<section class="shop-category"><h2>'+kinds[k]+'</h2><div class="shop-grid">'+stock.filter(i=>i.kind===k&&art(i.item_id)).map(i=>{const a={...art(i.item_id),...i};return '<article class="shop-product"><button class="shop-art '+k+'" data-shop-item="'+esc(i.item_id)+'">'+(k==='leaderboard'?shopLeaderboard(a,equipped):glossixShopArt(a,avatarMap.get(equipped.avatar_id)?.image||avatarMap.get('fox').image,{...equipped,rank_position:boardRow?.rank_position,account_level:boardRow?.account_level??equipped.level,weekly_points:boardRow?.points,avatarMarkup:profileAvatar(equipped)}))+'</button><div class="shop-product-body"><h2>'+esc(i.name)+'</h2><p>'+esc(i.description)+'</p><button data-shop-item="'+esc(i.item_id)+'">'+(i.owned?'Owned · preview':i.price+' coins · preview')+'</button></div></article>';}).join('')+'</div></section>').join('');
  const storefront=shopFront().replace('<span class="shop-opening">Opening soon</span>','<span class="shop-opening">Open</span>').replace('A future home for your next favourite customisations.<br>Keep learning. Your coins will be ready when the doors open.','Find your next favourite customisations.<br>Spend the coins you earn as you learn.').replace('<span class="pill">Coming soon</span>','<span class="pill">'+stock.filter(i=>art(i.item_id)).length+' designs</span>').replace(/<div class="shop-closed">[\s\S]*?<\/div><\/section><\/section>$/,collection+'</section></section>');
  host.innerHTML='<div class="shop-toolbar"><span class="eyebrow">MAKE IT YOURS</span><button class="shop-balance-button" data-page="wallet"><span class="coin-count">● '+Number(wallet.coins).toLocaleString()+' coins</span><span class="gem-count">◆ '+Number(wallet.gems||0).toLocaleString()+' gems</span></button></div>'+storefront;
 }
 const base=renderWalletShop;
 renderWalletShop=async function(){if(page!=='shop')return base();const token=++serial,user=GlossixOnline.user();$('#view').innerHTML='<section id="coin-shop"><h1>Shop</h1><p>Loading your collection…</p></section>';
  if(!user){$('#coin-shop').innerHTML='<h1>Make it yours</h1><p>Sign in to buy cosmetics with your coins.</p><button data-page="account">Sign in</button>';return;}
  try{const result=await Promise.all([GlossixOnline.rpc('glossix_shop_get'),GlossixOnline.rpc('glossix_wallet_get'),GlossixOnline.rpc('glossix_profile_view',{p_user_id:user.id}),Promise.allSettled([GlossixOnline.rpc('glossix_cosmetics_get',{p_user_id:user.id}),GlossixOnline.rpc('glossix_profile_extras_get',{p_user_id:user.id}),GlossixOnline.rpc('glossix_leaderboard_languages',{p_scope:'global',p_period:'weekly'}),GlossixOnline.rpc('glossix_owner_badge',{p_user_id:user.id})])]);if(token!==serial||page!=='shop'||GlossixOnline.user()?.id!==user.id)return;const [serverItems,balance,profile]=result;wallet=balance;equipped=profile;const additions=result[3];if(additions){for(const r of additions.slice(0,2))if(r.status==='fulfilled')equipped={...equipped,...r.value};boardRow=additions[2].status==='fulfilled'?additions[2].value.find(r=>r.user_id===user.id||r.is_you):null;}equipped.owner_badge=additions?.[3]?.status==='fulfilled'?additions[3].value:profile?.owner_badge===true;stock=GLOSSIX_SHOP_ITEMS.map(local=>{const remote=serverItems.find(i=>i.item_id===local.item_id);return {...local,...remote,owned:remote?.owned===true,available:!!remote};});if(!equipped){$('#coin-shop').innerHTML='<p>Create your profile before shopping.</p><button data-page="profile">Create profile</button>';return;}view();}
  catch{$('#coin-shop').innerHTML='<h1>Shop unavailable</h1><p>The shop setup is not available yet. Apply the combined shop SQL, then retry.</p><button data-shop-retry>Retry</button>';}
 };
 function preview(i){selected=i;const next=glossixPreviewProfile(equipped,i);let content=profileSummary(next);
  if(i.kind==='leaderboard'){
   const row={...(boardRow||{}),...next,user_id:equipped.user_id||GlossixOnline.user()?.id,account_level:boardRow?.account_level??equipped.level??'—',rank_position:boardRow?.rank_position??'—',points:boardRow?.points??'—',is_you:true};
   content='<section class="card compact-board"><h2>Your leaderboard row · Global · Weekly</h2><div class="shop-row-head"><span>Rank</span><span>Player</span><span>Lifetime level</span><span>Weekly points</span></div>'+shopLeaderboard(i,next)+(!boardRow?'<p class="note">You are not currently ranked on the global weekly leaderboard.</p>':'')+'</section>';
  }
  let d=document.querySelector('#coin-shop-detail');if(!d){d=document.createElement('dialog');d.id='coin-shop-detail';d.className='equipped-preview-dialog';document.body.append(d);}
  d.innerHTML='<button class="secondary" data-shop-close>Close</button><div class="equipped-preview-content">'+content+'</div><h2>'+esc(i.name)+'</h2><p>'+esc(i.description)+'</p><p>'+Number(i.price)+' coins · permanent cosmetic</p><p role="status" id="shop-action-status"></p><button data-shop-action '+(!i.available||(!i.owned&&wallet.coins<i.price)?'disabled':'')+'>'+(!i.available?'Purchases awaiting shop setup':i.owned?'Equip item':wallet.coins<i.price?'Not enough coins':'Buy for '+i.price+' coins')+'</button>';if(!d.open)d.showModal();
 }
 document.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;
  if(b.hasAttribute('data-shop-retry'))return renderWalletShop();
  if(b.dataset.shopFilter){filter=b.dataset.shopFilter;view();}
  if(b.dataset.shopItem){const i=stock.find(i=>i.item_id===b.dataset.shopItem);if(i)preview(i);}
  if(b.hasAttribute('data-shop-close'))document.querySelector('#coin-shop-detail')?.close();
  if(!b.hasAttribute('data-shop-action')||b.disabled||busy||!selected||!selected.available)return;
  const user=GlossixOnline.user(),item={...selected};busy=true;b.disabled=true;
  try{if(!item.owned){const result=await GlossixOnline.rpc('glossix_shop_buy',{p_item:item.item_id,p_expected_price:item.price});if(GlossixOnline.user()?.id!==user?.id)return;wallet.coins=result.coins;item.owned=true;const row=stock.find(i=>i.item_id===item.item_id);if(row)row.owned=true;view();preview(item);document.querySelector('#shop-action-status').textContent='Purchased. You can now equip it.';}
   else{await GlossixOnline.rpc('glossix_shop_equip',{p_item:item.item_id});if(GlossixOnline.user()?.id!==user?.id)return;equipped=glossixPreviewProfile(equipped,item);if(item.kind==='avatar'){try{localStorage.setItem('glossix-avatar-account:'+user.id,item.cosmetic_id);}catch{}updateHeaderAvatar();}document.querySelector('#shop-action-status').textContent='Equipped successfully.';view();}}
  catch(error){const status=document.querySelector('#shop-action-status');if(status)status.textContent=error.message;}
  finally{busy=false;if(b.isConnected)b.disabled=false;}
 });
 if(page==='shop')renderWalletShop();
})();
