const list=document.querySelector('#course-list');
for(const [code,pack] of Object.entries(GlossixLanguages.catalog)){
  if(pack.status==='available'||pack.status==='removed')continue;
  const row=document.createElement('tr');
  for(const value of [pack.name,pack.native,pack.direction==='rtl'?'Right to left':'Left to right']){
    const cell=document.createElement('td');cell.textContent=value;
    if(value===pack.native){cell.lang=pack.locale;cell.dir=pack.direction;}
    row.append(cell);
  }
  const cell=document.createElement('td'),badge=document.createElement('span');
  badge.className='badge '+(pack.priority===1?'first':'planned');
  badge.textContent=pack.status==='preview'?'Course preview':'Planned';cell.append(badge);row.append(cell);list.append(row);
}
