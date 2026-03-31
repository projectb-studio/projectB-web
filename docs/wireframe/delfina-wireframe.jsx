import { useState } from "react";

const PAGES = ["home","shop","detail","cart","brand"];
const CATS = ["ALL","OUTER","TOP","BOTTOM","KNIT","DENIM","ACC"];
const PRODUCTS = [
  {cat:"OUTER",name:"Cashmere blend overcoat",price:"298,000",img:"#E8DDD3",badge:null},
  {cat:"TOP",name:"Silk blouse",price:"158,000",img:"#F5F0EB",badge:"NEW"},
  {cat:"KNIT",name:"Wool turtleneck",price:"89,000",img:"#E0D5C8",badge:"-30%",original:"128,000"},
  {cat:"BOTTOM",name:"Wide leg slacks",price:"178,000",img:"#D4C4B0",badge:null},
  {cat:"DENIM",name:"Straight denim",price:"138,000",img:"#C8BEB0",badge:"BEST"},
  {cat:"ACC",name:"Leather belt",price:"68,000",img:"#E8DDD3",badge:null},
  {cat:"OUTER",name:"Trench coat",price:"348,000",img:"#D0C4B6",badge:"NEW"},
  {cat:"TOP",name:"Linen shirt",price:"118,000",img:"#F0E8E0",badge:null},
];

const C={dk:"#3D2B1F",br:"#6B4C3B",wm:"#8B6F5E",sd:"#C4A882",cr:"#E8DDD3",iv:"#F5F0EB",wh:"#FAFAF8",bk:"#1A1A1A",red:"#C75050",gold:"#B8860B"};

const Nav=({page,setPage})=>(
  <div style={{background:C.wh,borderBottom:`1px solid ${C.cr}`,padding:"0 20px",position:"sticky",top:0,zIndex:10}}>
    <div style={{maxWidth:800,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:56}}>
      <span onClick={()=>setPage("home")} style={{fontFamily:"Georgia,serif",fontSize:22,fontWeight:500,color:C.dk,cursor:"pointer",letterSpacing:-0.5}}>Delfina</span>
      <div style={{display:"flex",gap:24,fontSize:12,letterSpacing:1.5,textTransform:"uppercase",color:C.wm}}>
        {[["shop","Shop"],["brand","Brand"],["home","Magazine"]].map(([p,l])=>(
          <span key={l} onClick={()=>setPage(p)} style={{cursor:"pointer",color:page===p?C.dk:C.wm,fontWeight:page===p?500:400,borderBottom:page===p?`1.5px solid ${C.dk}`:"none",paddingBottom:4}}>{l}</span>
        ))}
      </div>
      <div style={{display:"flex",gap:16,fontSize:13,color:C.wm}}>
        <span style={{cursor:"pointer"}} onClick={()=>setPage("cart")}>Bag(0)</span>
        <span style={{cursor:"pointer"}}>Login</span>
      </div>
    </div>
  </div>
);

const Footer=()=>(
  <div style={{background:C.dk,padding:"40px 20px",marginTop:60}}>
    <div style={{maxWidth:800,margin:"0 auto",color:C.cr}}>
      <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:24,marginBottom:24}}>
        <div>
          <div style={{fontFamily:"Georgia,serif",fontSize:20,color:C.iv,marginBottom:12}}>Delfina</div>
          <div style={{fontSize:12,lineHeight:1.8,color:C.wm}}>
            Self-made premium clothing<br/>
            CS: KakaoTalk @delfina<br/>
            Mon-Fri 10:00-18:00
          </div>
        </div>
        <div style={{display:"flex",gap:32}}>
          {[["Shop","Outer, Top, Bottom, Knit, Denim, Acc"],["Help","FAQ, 1:1, Return, Terms"]].map(([t,items])=>(
            <div key={t}>
              <div style={{fontSize:11,letterSpacing:1,textTransform:"uppercase",color:C.sd,marginBottom:8}}>{t}</div>
              <div style={{fontSize:12,lineHeight:2,color:C.wm}}>{items.split(", ").map(i=><div key={i} style={{cursor:"pointer"}}>{i}</div>)}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{borderTop:`1px solid ${C.br}`,paddingTop:16,fontSize:11,color:C.wm}}>
        &copy; 2026 Delfina. All rights reserved.
      </div>
    </div>
  </div>
);

const ProductCard=({p,onClick})=>(
  <div onClick={onClick} style={{cursor:"pointer",textAlign:"center"}}>
    <div style={{width:"100%",aspectRatio:"3/4",background:p.img,borderRadius:4,marginBottom:10,position:"relative",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:C.wm}}>
      {p.badge&&<span style={{position:"absolute",top:8,left:8,background:p.badge.includes("%")?C.red:p.badge==="BEST"?C.dk:C.iv,color:p.badge==="NEW"?C.br:"#fff",fontSize:10,padding:"3px 8px",borderRadius:2,fontWeight:500,letterSpacing:0.5}}>{p.badge}</span>}
      Photo
    </div>
    <div style={{fontSize:10,color:C.wm,letterSpacing:1.2,textTransform:"uppercase",marginBottom:3}}>{p.cat}</div>
    <div style={{fontSize:13,fontWeight:500,color:C.bk,marginBottom:3}}>{p.name}</div>
    <div style={{fontSize:14,fontWeight:500,color:p.original?C.red:C.dk}}>
      W {p.price}
      {p.original&&<span style={{fontSize:11,color:"#aaa",textDecoration:"line-through",marginLeft:6,fontWeight:400}}>W {p.original}</span>}
    </div>
  </div>
);

const HomePage=({setPage})=>(
  <div>
    <div style={{width:"100%",height:400,background:`linear-gradient(135deg, ${C.cr}, ${C.iv})`,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
      <div style={{fontSize:11,letterSpacing:3,textTransform:"uppercase",color:C.wm}}>2026 Spring Collection</div>
      <div style={{fontFamily:"Georgia,serif",fontSize:36,color:C.dk,letterSpacing:-1}}>Quiet Luxury</div>
      <div style={{fontSize:13,color:C.wm,maxWidth:400,textAlign:"center",lineHeight:1.7}}>Timeless elegance crafted with care. Every piece tells a story of refined simplicity.</div>
      <button onClick={()=>setPage("shop")} style={{marginTop:8,padding:"12px 32px",background:C.dk,color:C.iv,border:"none",fontSize:12,letterSpacing:1.5,textTransform:"uppercase",cursor:"pointer",borderRadius:0}}>Shop now</button>
    </div>

    <div style={{maxWidth:800,margin:"40px auto",padding:"0 20px"}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <div style={{fontSize:11,letterSpacing:2,textTransform:"uppercase",color:C.wm,marginBottom:6}}>New arrivals</div>
        <div style={{fontFamily:"Georgia,serif",fontSize:24,color:C.dk}}>Just in</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
        {PRODUCTS.slice(0,4).map((p,i)=><ProductCard key={i} p={p} onClick={()=>setPage("detail")}/>)}
      </div>
    </div>

    <div style={{maxWidth:800,margin:"48px auto",padding:"0 20px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      {[{t:"Outer collection",bg:C.cr},{t:"Knit essentials",bg:"#D8CFC4"}].map(b=>(
        <div key={b.t} style={{height:240,background:b.bg,borderRadius:4,display:"flex",alignItems:"flex-end",padding:20,cursor:"pointer"}} onClick={()=>setPage("shop")}>
          <div>
            <div style={{fontSize:11,letterSpacing:1.5,textTransform:"uppercase",color:C.wm,marginBottom:4}}>Collection</div>
            <div style={{fontSize:18,fontWeight:500,color:C.dk}}>{b.t}</div>
          </div>
        </div>
      ))}
    </div>

    <div style={{maxWidth:800,margin:"48px auto",padding:"0 20px",textAlign:"center"}}>
      <div style={{fontSize:11,letterSpacing:2,textTransform:"uppercase",color:C.wm,marginBottom:6}}>Best sellers</div>
      <div style={{fontFamily:"Georgia,serif",fontSize:24,color:C.dk,marginBottom:24}}>Most loved</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
        {PRODUCTS.slice(4,8).map((p,i)=><ProductCard key={i} p={p} onClick={()=>setPage("detail")}/>)}
      </div>
    </div>

    <div style={{background:C.iv,padding:"48px 20px",margin:"48px 0 0",textAlign:"center"}}>
      <div style={{fontFamily:"Georgia,serif",fontSize:20,color:C.dk,marginBottom:8}}>Join Delfina</div>
      <div style={{fontSize:13,color:C.wm,marginBottom:20}}>Subscribe for exclusive access and 10% off your first order</div>
      <div style={{display:"flex",maxWidth:400,margin:"0 auto",gap:8}}>
        <input placeholder="Email address" style={{flex:1,padding:"10px 16px",border:`1px solid ${C.cr}`,borderRadius:0,fontSize:13,background:C.wh,outline:"none"}}/>
        <button style={{padding:"10px 24px",background:C.dk,color:C.iv,border:"none",fontSize:12,letterSpacing:1,cursor:"pointer",borderRadius:0}}>Subscribe</button>
      </div>
    </div>
  </div>
);

const ShopPage=({setPage})=>{
  const[cat,setCat]=useState("ALL");
  const filtered=cat==="ALL"?PRODUCTS:PRODUCTS.filter(p=>p.cat===cat);
  return(
    <div style={{maxWidth:800,margin:"0 auto",padding:"32px 20px"}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <div style={{fontFamily:"Georgia,serif",fontSize:28,color:C.dk,marginBottom:16}}>Shop</div>
        <div style={{display:"flex",justifyContent:"center",gap:20,flexWrap:"wrap"}}>
          {CATS.map(c=>(
            <span key={c} onClick={()=>setCat(c)} style={{fontSize:11,letterSpacing:1.5,textTransform:"uppercase",color:cat===c?C.dk:C.wm,cursor:"pointer",fontWeight:cat===c?500:400,borderBottom:cat===c?`1.5px solid ${C.dk}`:"none",paddingBottom:4}}>{c}</span>
          ))}
        </div>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <span style={{fontSize:12,color:C.wm}}>{filtered.length} products</span>
        <select style={{fontSize:12,border:`1px solid ${C.cr}`,padding:"6px 12px",color:C.wm,background:C.wh,borderRadius:0}}>
          <option>Latest</option><option>Price low</option><option>Price high</option><option>Best</option>
        </select>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
        {filtered.map((p,i)=><ProductCard key={i} p={p} onClick={()=>setPage("detail")}/>)}
      </div>
    </div>
  );
};

const DetailPage=({setPage})=>(
  <div style={{maxWidth:800,margin:"0 auto",padding:"20px"}}>
    <div style={{fontSize:12,color:C.wm,marginBottom:20}}>
      <span style={{cursor:"pointer"}} onClick={()=>setPage("home")}>Home</span>
      <span style={{margin:"0 8px"}}>/</span>
      <span style={{cursor:"pointer"}} onClick={()=>setPage("shop")}>Shop</span>
      <span style={{margin:"0 8px"}}>/</span>
      <span>Outer</span>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:32}}>
      <div>
        <div style={{aspectRatio:"3/4",background:C.cr,borderRadius:4,marginBottom:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:C.wm}}>Main product photo</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4}}>
          {[1,2,3,4].map(i=><div key={i} style={{aspectRatio:"1",background:i===1?C.cr:C.iv,borderRadius:2,border:i===1?`1.5px solid ${C.dk}`:`1px solid ${C.cr}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:C.wm,cursor:"pointer"}}>Img {i}</div>)}
        </div>
      </div>
      <div>
        <div style={{fontSize:10,letterSpacing:1.5,textTransform:"uppercase",color:C.wm,marginBottom:6}}>Outer</div>
        <div style={{fontFamily:"Georgia,serif",fontSize:24,color:C.dk,marginBottom:8}}>Cashmere blend overcoat</div>
        <div style={{fontSize:22,fontWeight:500,color:C.dk,marginBottom:20}}>W 298,000</div>

        <div style={{fontSize:13,color:C.wm,marginBottom:16,lineHeight:1.7}}>Soft silhouette with a relaxed fit. Made with premium cashmere blend fabric for lasting comfort and elegance.</div>

        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,letterSpacing:1,textTransform:"uppercase",color:C.wm,marginBottom:8}}>Color</div>
          <div style={{display:"flex",gap:8}}>
            {["#3D2B1F","#E8DDD3","#1A1A1A"].map(c=><div key={c} style={{width:28,height:28,background:c,borderRadius:"50%",border:c===C.dk?`2px solid ${C.dk}`:`1px solid ${C.cr}`,cursor:"pointer"}}/>)}
          </div>
        </div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,letterSpacing:1,textTransform:"uppercase",color:C.wm,marginBottom:8}}>Size</div>
          <div style={{display:"flex",gap:6}}>
            {["S","M","L","XL"].map(s=><div key={s} style={{width:40,height:36,display:"flex",alignItems:"center",justifyContent:"center",border:s==="M"?`1.5px solid ${C.dk}`:`1px solid ${C.cr}`,fontSize:12,color:s==="M"?C.dk:C.wm,cursor:"pointer",fontWeight:s==="M"?500:400}}>{s}</div>)}
          </div>
          <div style={{fontSize:11,color:C.sd,marginTop:6,cursor:"pointer",textDecoration:"underline"}}>Size guide</div>
        </div>
        <div style={{marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{display:"flex",border:`1px solid ${C.cr}`}}>
              <button style={{width:32,height:36,border:"none",background:"transparent",fontSize:16,cursor:"pointer",color:C.wm}}>-</button>
              <div style={{width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,borderLeft:`1px solid ${C.cr}`,borderRight:`1px solid ${C.cr}`}}>1</div>
              <button style={{width:32,height:36,border:"none",background:"transparent",fontSize:16,cursor:"pointer",color:C.dk}}>+</button>
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          <button onClick={()=>setPage("cart")} style={{flex:1,padding:"14px",background:C.dk,color:C.iv,border:"none",fontSize:13,letterSpacing:1,textTransform:"uppercase",cursor:"pointer",borderRadius:0}}>Add to cart</button>
          <button style={{width:48,height:48,border:`1px solid ${C.cr}`,background:"transparent",fontSize:16,cursor:"pointer",borderRadius:0}}>&#9825;</button>
        </div>
        <div style={{borderTop:`1px solid ${C.cr}`,paddingTop:16}}>
          {["Shipping info","Care instructions","Return policy"].map(t=>(
            <div key={t} style={{display:"flex",justifyContent:"space-between",padding:"12px 0",borderBottom:`1px solid ${C.iv}`,fontSize:13,color:C.wm,cursor:"pointer"}}>
              <span>{t}</span><span>+</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const CartPage=({setPage})=>(
  <div style={{maxWidth:800,margin:"0 auto",padding:"32px 20px"}}>
    <div style={{fontFamily:"Georgia,serif",fontSize:24,color:C.dk,marginBottom:24}}>Shopping bag</div>
    <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:32}}>
      <div>
        {[PRODUCTS[0],PRODUCTS[2]].map((p,i)=>(
          <div key={i} style={{display:"flex",gap:16,padding:"20px 0",borderBottom:`1px solid ${C.cr}`}}>
            <div style={{width:100,height:130,background:p.img,borderRadius:4,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:C.wm}}>Photo</div>
            <div style={{flex:1}}>
              <div style={{fontSize:10,letterSpacing:1,textTransform:"uppercase",color:C.wm,marginBottom:4}}>{p.cat}</div>
              <div style={{fontSize:14,fontWeight:500,color:C.dk,marginBottom:4}}>{p.name}</div>
              <div style={{fontSize:12,color:C.wm,marginBottom:8}}>Color: Brown / Size: M</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",border:`1px solid ${C.cr}`,width:"fit-content"}}>
                  <button style={{width:28,height:28,border:"none",background:"transparent",fontSize:14,cursor:"pointer",color:C.wm}}>-</button>
                  <div style={{width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,borderLeft:`1px solid ${C.cr}`,borderRight:`1px solid ${C.cr}`}}>1</div>
                  <button style={{width:28,height:28,border:"none",background:"transparent",fontSize:14,cursor:"pointer"}}>+</button>
                </div>
                <div style={{fontSize:14,fontWeight:500,color:C.dk}}>W {p.price}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{background:C.iv,padding:24,borderRadius:4,alignSelf:"start",position:"sticky",top:76}}>
        <div style={{fontSize:14,fontWeight:500,color:C.dk,marginBottom:16}}>Order summary</div>
        <div style={{fontSize:13,color:C.wm,display:"flex",justifyContent:"space-between",marginBottom:8}}><span>Subtotal</span><span>W 387,000</span></div>
        <div style={{fontSize:13,color:C.wm,display:"flex",justifyContent:"space-between",marginBottom:8}}><span>Shipping</span><span>Free</span></div>
        <div style={{borderTop:`1px solid ${C.cr}`,paddingTop:12,marginTop:12,fontSize:16,fontWeight:500,color:C.dk,display:"flex",justifyContent:"space-between"}}><span>Total</span><span>W 387,000</span></div>
        <button style={{width:"100%",marginTop:16,padding:"14px",background:C.dk,color:C.iv,border:"none",fontSize:13,letterSpacing:1,textTransform:"uppercase",cursor:"pointer",borderRadius:0}}>Checkout</button>
        <div style={{textAlign:"center",marginTop:12}}>
          <span onClick={()=>setPage("shop")} style={{fontSize:12,color:C.wm,cursor:"pointer",textDecoration:"underline"}}>Continue shopping</span>
        </div>
      </div>
    </div>
  </div>
);

const BrandPage=()=>(
  <div>
    <div style={{height:300,background:`linear-gradient(135deg, ${C.cr}, #D0C0B0)`,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
      <div style={{fontFamily:"Georgia,serif",fontSize:36,color:C.dk}}>Delfina</div>
      <div style={{fontSize:13,color:C.wm,maxWidth:500,textAlign:"center",lineHeight:1.8}}>We believe in the beauty of simplicity. Each piece is designed and crafted in our atelier with meticulous attention to detail.</div>
    </div>
    <div style={{maxWidth:600,margin:"48px auto",padding:"0 20px",textAlign:"center"}}>
      <div style={{fontSize:11,letterSpacing:2,textTransform:"uppercase",color:C.wm,marginBottom:8}}>Our philosophy</div>
      <div style={{fontFamily:"Georgia,serif",fontSize:20,color:C.dk,marginBottom:16}}>Quiet luxury, loud quality</div>
      <div style={{fontSize:14,color:C.wm,lineHeight:1.8}}>
        Founded with a vision to create timeless wardrobe essentials, Delfina combines traditional craftsmanship with contemporary design. We source only the finest materials and produce in small batches to ensure quality over quantity.
      </div>
    </div>
  </div>
);

export default function DelfinaWireframe(){
  const[page,setPage]=useState("home");
  return(
    <div style={{background:C.wh,minHeight:"100vh",fontFamily:"system-ui,-apple-system,sans-serif"}}>
      <Nav page={page} setPage={setPage}/>
      {page==="home"&&<HomePage setPage={setPage}/>}
      {page==="shop"&&<ShopPage setPage={setPage}/>}
      {page==="detail"&&<DetailPage setPage={setPage}/>}
      {page==="cart"&&<CartPage setPage={setPage}/>}
      {page==="brand"&&<BrandPage/>}
      <Footer/>
    </div>
  );
}
