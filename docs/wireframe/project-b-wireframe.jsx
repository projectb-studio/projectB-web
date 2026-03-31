import { useState } from "react";

const PAGES = ["home","shop","detail","cart","brand","store"];
const PRODUCTS = [
  {name:"Ceramic vase — matte black",price:"38,000",img:"#E8E8E8",badge:null,tag:"handmade"},
  {name:"Linen table runner — ivory",price:"28,000",img:"#F0F0F0",badge:"NEW",tag:"fabric"},
  {name:"Brass candle holder set",price:"52,000",img:"#E0E0E0",badge:null,tag:"metal"},
  {name:"Wool felt coaster (4p)",price:"18,000",img:"#EBEBEB",badge:"BEST",tag:"fabric"},
  {name:"Oak wood tray — natural",price:"45,000",img:"#E5E5E5",badge:null,tag:"wood"},
  {name:"Cotton blend napkin set",price:"22,000",img:"#F2F2F2",badge:"-20%",original:"27,500",tag:"fabric"},
  {name:"Stone incense holder",price:"32,000",img:"#DEDEDE",badge:"NEW",tag:"stone"},
  {name:"Hand-blown glass cup",price:"28,000",img:"#E8E8E8",badge:null,tag:"glass"},
];

const C={bk:"#0A0A0A",dk:"#1A1A1A",ch:"#333",gr:"#666",si:"#999",lg:"#D4D4D4",ow:"#F0F0F0",sn:"#FAFAFA",red:"#C75050"};

const Nav=({page,setPage})=>(
  <div style={{background:C.sn,borderBottom:`1px solid ${C.lg}`,padding:"0 24px",position:"sticky",top:0,zIndex:10}}>
    <div style={{maxWidth:800,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:60}}>
      <span onClick={()=>setPage("home")} style={{fontSize:18,fontWeight:500,color:C.bk,cursor:"pointer",letterSpacing:6,textTransform:"uppercase",fontFamily:"system-ui"}}>Project B</span>
      <div style={{display:"flex",gap:28,fontSize:11,letterSpacing:2,textTransform:"uppercase",color:C.gr}}>
        {[["shop","Shop"],["brand","About"],["store","Store"],["home","Journal"]].map(([p,l])=>(
          <span key={l} onClick={()=>setPage(p)} style={{cursor:"pointer",color:page===p?C.bk:C.gr,fontWeight:page===p?500:400}}>{l}</span>
        ))}
      </div>
      <div style={{display:"flex",gap:16,fontSize:12,color:C.gr}}>
        <span style={{cursor:"pointer"}} onClick={()=>setPage("cart")}>Cart(0)</span>
        <span style={{cursor:"pointer"}}>Login</span>
      </div>
    </div>
  </div>
);

const Footer=()=>(
  <div style={{background:C.bk,padding:"48px 24px",marginTop:80}}>
    <div style={{maxWidth:800,margin:"0 auto",color:C.si}}>
      <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:32,marginBottom:32}}>
        <div>
          <div style={{fontSize:16,fontWeight:500,color:C.sn,letterSpacing:4,textTransform:"uppercase",marginBottom:16}}>Project B</div>
          <div style={{fontSize:12,lineHeight:2,color:C.si}}>
            Handcrafted lifestyle accessories<br/>
            Mon–Sat 11:00–20:00<br/>
            KakaoTalk @projectb
          </div>
        </div>
        <div style={{display:"flex",gap:40}}>
          {[["Shop","All products"],["Help","FAQ, Contact, Returns"],["Follow","Instagram, Kakao"]].map(([t,d])=>(
            <div key={t}>
              <div style={{fontSize:10,letterSpacing:2,textTransform:"uppercase",color:C.lg,marginBottom:10}}>{t}</div>
              <div style={{fontSize:12,lineHeight:2.2,color:C.si}}>{d.split(", ").map(i=><div key={i} style={{cursor:"pointer"}}>{i}</div>)}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{borderTop:`1px solid ${C.ch}`,paddingTop:20,fontSize:11,color:C.gr,display:"flex",justifyContent:"space-between"}}>
        <span>&copy; 2026 Project B</span>
        <span>Terms / Privacy</span>
      </div>
    </div>
  </div>
);

const ProductCard=({p,onClick})=>(
  <div onClick={onClick} style={{cursor:"pointer"}}>
    <div style={{width:"100%",aspectRatio:"1/1",background:p.img,marginBottom:10,position:"relative",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:C.si}}>
      {p.badge&&<span style={{position:"absolute",top:0,left:0,background:p.badge.includes("%")?C.red:p.badge==="NEW"?C.bk:C.ow,color:p.badge==="BEST"?C.ch:"#fff",fontSize:9,padding:"4px 8px",fontWeight:500,letterSpacing:0.5}}>{p.badge}</span>}
      Photo
    </div>
    <div style={{fontSize:13,fontWeight:500,color:C.dk,marginBottom:3,lineHeight:1.4}}>{p.name}</div>
    <div style={{fontSize:13,fontWeight:500,color:p.original?C.red:C.bk}}>
      {p.price}
      {p.original&&<span style={{fontSize:11,color:C.si,textDecoration:"line-through",marginLeft:6,fontWeight:400}}>{p.original}</span>}
    </div>
  </div>
);

const HomePage=({setPage})=>(
  <div>
    <div style={{width:"100%",height:440,background:C.ow,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
      <div style={{fontSize:10,letterSpacing:4,textTransform:"uppercase",color:C.si}}>Handcrafted lifestyle</div>
      <div style={{fontSize:36,fontWeight:500,color:C.bk,letterSpacing:8,textTransform:"uppercase",fontFamily:"system-ui"}}>Project B</div>
      <div style={{fontSize:13,color:C.gr,maxWidth:420,textAlign:"center",lineHeight:1.8}}>Curated accessories for mindful living. Every piece is crafted by hand with care and intention.</div>
      <div style={{display:"flex",gap:12,marginTop:8}}>
        <button onClick={()=>setPage("shop")} style={{padding:"12px 32px",background:C.bk,color:C.sn,border:"none",fontSize:11,letterSpacing:2,textTransform:"uppercase",cursor:"pointer"}}>Shop online</button>
        <button onClick={()=>setPage("store")} style={{padding:"12px 32px",background:"transparent",color:C.bk,border:`1.5px solid ${C.bk}`,fontSize:11,letterSpacing:2,textTransform:"uppercase",cursor:"pointer"}}>Visit store</button>
      </div>
    </div>

    <div style={{maxWidth:800,margin:"48px auto",padding:"0 24px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:24}}>
        <div style={{fontSize:11,letterSpacing:3,textTransform:"uppercase",color:C.si}}>New in</div>
        <span onClick={()=>setPage("shop")} style={{fontSize:11,color:C.gr,cursor:"pointer",textDecoration:"underline"}}>View all</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:20}}>
        {PRODUCTS.slice(0,4).map((p,i)=><ProductCard key={i} p={p} onClick={()=>setPage("detail")}/>)}
      </div>
    </div>

    <div style={{maxWidth:800,margin:"64px auto",padding:"0 24px"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,height:280}}>
        <div onClick={()=>setPage("store")} style={{background:C.bk,display:"flex",alignItems:"flex-end",padding:28,cursor:"pointer"}}>
          <div>
            <div style={{fontSize:10,letterSpacing:2,textTransform:"uppercase",color:C.si,marginBottom:6}}>Offline</div>
            <div style={{fontSize:18,fontWeight:500,color:C.sn,letterSpacing:1}}>Visit our store</div>
            <div style={{fontSize:12,color:C.si,marginTop:6}}>Mon–Sat 11:00–20:00</div>
          </div>
        </div>
        <div onClick={()=>setPage("brand")} style={{background:C.ow,display:"flex",alignItems:"flex-end",padding:28,cursor:"pointer"}}>
          <div>
            <div style={{fontSize:10,letterSpacing:2,textTransform:"uppercase",color:C.si,marginBottom:6}}>Story</div>
            <div style={{fontSize:18,fontWeight:500,color:C.bk,letterSpacing:1}}>Our craft</div>
            <div style={{fontSize:12,color:C.gr,marginTop:6}}>Handmade with intention</div>
          </div>
        </div>
      </div>
    </div>

    <div style={{maxWidth:800,margin:"64px auto",padding:"0 24px"}}>
      <div style={{fontSize:11,letterSpacing:3,textTransform:"uppercase",color:C.si,marginBottom:24}}>Best sellers</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:20}}>
        {PRODUCTS.slice(4,8).map((p,i)=><ProductCard key={i} p={p} onClick={()=>setPage("detail")}/>)}
      </div>
    </div>

    <div style={{background:C.ow,padding:"48px 24px",margin:"64px 0 0",textAlign:"center"}}>
      <div style={{fontSize:11,letterSpacing:3,textTransform:"uppercase",color:C.si,marginBottom:8}}>Newsletter</div>
      <div style={{fontSize:18,fontWeight:500,color:C.bk,letterSpacing:2,marginBottom:16}}>Stay in touch</div>
      <div style={{display:"flex",maxWidth:420,margin:"0 auto",gap:0}}>
        <input placeholder="Email" style={{flex:1,padding:"12px 16px",border:`1.5px solid ${C.lg}`,borderRight:"none",fontSize:13,background:C.sn,outline:"none"}}/>
        <button style={{padding:"12px 24px",background:C.bk,color:C.sn,border:"none",fontSize:11,letterSpacing:1,cursor:"pointer",textTransform:"uppercase"}}>Subscribe</button>
      </div>
    </div>
  </div>
);

const ShopPage=({setPage})=>{
  const[tag,setTag]=useState("all");
  const tags=["all","handmade","fabric","metal","wood","stone","glass"];
  const filtered=tag==="all"?PRODUCTS:PRODUCTS.filter(p=>p.tag===tag);
  return(
    <div style={{maxWidth:800,margin:"0 auto",padding:"40px 24px"}}>
      <div style={{marginBottom:32}}>
        <div style={{fontSize:11,letterSpacing:3,textTransform:"uppercase",color:C.si,marginBottom:8}}>Shop</div>
        <div style={{fontSize:24,fontWeight:500,color:C.bk,letterSpacing:4,textTransform:"uppercase",marginBottom:20}}>All products</div>
        <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
          {tags.map(t=>(
            <span key={t} onClick={()=>setTag(t)} style={{fontSize:11,letterSpacing:1.5,textTransform:"uppercase",color:tag===t?C.bk:C.si,cursor:"pointer",fontWeight:tag===t?500:400,paddingBottom:2,borderBottom:tag===t?`1.5px solid ${C.bk}`:"none"}}>{t}</span>
          ))}
        </div>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,paddingBottom:12,borderBottom:`1px solid ${C.lg}`}}>
        <span style={{fontSize:12,color:C.si}}>{filtered.length} items</span>
        <select style={{fontSize:12,border:`1px solid ${C.lg}`,padding:"6px 12px",color:C.gr,background:C.sn}}>
          <option>Latest</option><option>Price: low</option><option>Price: high</option><option>Best</option>
        </select>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:20}}>
        {filtered.map((p,i)=><ProductCard key={i} p={p} onClick={()=>setPage("detail")}/>)}
      </div>
    </div>
  );
};

const DetailPage=({setPage})=>(
  <div style={{maxWidth:800,margin:"0 auto",padding:"24px"}}>
    <div style={{fontSize:11,color:C.si,marginBottom:24}}>
      <span style={{cursor:"pointer"}} onClick={()=>setPage("home")}>Home</span>
      <span style={{margin:"0 8px"}}>/</span>
      <span style={{cursor:"pointer"}} onClick={()=>setPage("shop")}>Shop</span>
      <span style={{margin:"0 8px"}}>/</span>
      <span>Detail</span>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:32}}>
      <div>
        <div style={{aspectRatio:"1/1",background:C.ow,marginBottom:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:C.si}}>Main photo</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4}}>
          {[1,2,3,4].map(i=><div key={i} style={{aspectRatio:"1",background:i===1?C.lg:C.ow,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:C.si,cursor:"pointer",border:i===1?`1.5px solid ${C.bk}`:`1px solid ${C.lg}`}}>{i}</div>)}
        </div>
      </div>
      <div>
        <div style={{fontSize:10,letterSpacing:2,textTransform:"uppercase",color:C.si,marginBottom:8}}>Handmade</div>
        <div style={{fontSize:22,fontWeight:500,color:C.bk,letterSpacing:1,marginBottom:8}}>Ceramic vase — matte black</div>
        <div style={{fontSize:20,fontWeight:500,color:C.bk,marginBottom:20}}>38,000</div>
        <div style={{fontSize:13,color:C.gr,lineHeight:1.8,marginBottom:24}}>
          Handcrafted matte black ceramic vase. Each piece is unique with subtle variations in texture and form. Perfect as a standalone object or with dried flowers.
        </div>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:10,letterSpacing:1.5,textTransform:"uppercase",color:C.si,marginBottom:8}}>Size</div>
          <div style={{display:"flex",gap:6}}>
            {["S","M","L"].map(s=><div key={s} style={{width:44,height:40,display:"flex",alignItems:"center",justifyContent:"center",border:s==="M"?`1.5px solid ${C.bk}`:`1px solid ${C.lg}`,fontSize:12,color:s==="M"?C.bk:C.gr,cursor:"pointer",fontWeight:s==="M"?500:400}}>{s}</div>)}
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
          <div style={{display:"flex",border:`1px solid ${C.lg}`}}>
            <button style={{width:36,height:40,border:"none",background:"transparent",fontSize:16,cursor:"pointer",color:C.gr}}>−</button>
            <div style={{width:40,height:40,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,borderLeft:`1px solid ${C.lg}`,borderRight:`1px solid ${C.lg}`}}>1</div>
            <button style={{width:36,height:40,border:"none",background:"transparent",fontSize:16,cursor:"pointer"}}>+</button>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setPage("cart")} style={{flex:1,padding:"14px",background:C.bk,color:C.sn,border:"none",fontSize:12,letterSpacing:2,textTransform:"uppercase",cursor:"pointer"}}>Add to cart</button>
          <button style={{width:48,height:48,border:`1.5px solid ${C.lg}`,background:"transparent",fontSize:18,cursor:"pointer",color:C.gr}}>&#9825;</button>
        </div>
        <div style={{borderTop:`1px solid ${C.lg}`,marginTop:24,paddingTop:16}}>
          {["Product details","Shipping & returns","Care instructions"].map(t=>(
            <div key={t} style={{display:"flex",justifyContent:"space-between",padding:"14px 0",borderBottom:`1px solid ${C.ow}`,fontSize:13,color:C.ch,cursor:"pointer"}}>
              <span>{t}</span><span style={{color:C.si}}>+</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const CartPage=({setPage})=>(
  <div style={{maxWidth:800,margin:"0 auto",padding:"40px 24px"}}>
    <div style={{fontSize:20,fontWeight:500,color:C.bk,letterSpacing:3,textTransform:"uppercase",marginBottom:32}}>Cart</div>
    <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:40}}>
      <div>
        {PRODUCTS.slice(0,2).map((p,i)=>(
          <div key={i} style={{display:"flex",gap:16,padding:"20px 0",borderBottom:`1px solid ${C.lg}`}}>
            <div style={{width:100,height:100,background:p.img,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:C.si}}>Photo</div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:500,color:C.dk,marginBottom:4}}>{p.name}</div>
              <div style={{fontSize:11,color:C.si,marginBottom:10}}>Size: M</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",border:`1px solid ${C.lg}`}}>
                  <button style={{width:28,height:28,border:"none",background:"transparent",fontSize:14,cursor:"pointer",color:C.gr}}>−</button>
                  <div style={{width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,borderLeft:`1px solid ${C.lg}`,borderRight:`1px solid ${C.lg}`}}>1</div>
                  <button style={{width:28,height:28,border:"none",background:"transparent",fontSize:14,cursor:"pointer"}}>+</button>
                </div>
                <span style={{fontSize:13,fontWeight:500,color:C.bk}}>{p.price}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{background:C.ow,padding:24,alignSelf:"start",position:"sticky",top:80}}>
        <div style={{fontSize:13,fontWeight:500,color:C.bk,letterSpacing:1,textTransform:"uppercase",marginBottom:16}}>Summary</div>
        <div style={{fontSize:12,color:C.gr,display:"flex",justifyContent:"space-between",marginBottom:8}}><span>Subtotal</span><span>66,000</span></div>
        <div style={{fontSize:12,color:C.gr,display:"flex",justifyContent:"space-between",marginBottom:8}}><span>Shipping</span><span>3,000</span></div>
        <div style={{borderTop:`1px solid ${C.lg}`,paddingTop:12,marginTop:12,fontSize:15,fontWeight:500,color:C.bk,display:"flex",justifyContent:"space-between"}}><span>Total</span><span>69,000</span></div>
        <button style={{width:"100%",marginTop:16,padding:"14px",background:C.bk,color:C.sn,border:"none",fontSize:12,letterSpacing:2,textTransform:"uppercase",cursor:"pointer"}}>Checkout</button>
        <div style={{textAlign:"center",marginTop:12}}>
          <span onClick={()=>setPage("shop")} style={{fontSize:11,color:C.gr,cursor:"pointer",textDecoration:"underline"}}>Continue shopping</span>
        </div>
      </div>
    </div>
  </div>
);

const BrandPage=()=>(
  <div>
    <div style={{height:320,background:C.ow,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
      <div style={{fontSize:10,letterSpacing:4,textTransform:"uppercase",color:C.si}}>Our story</div>
      <div style={{fontSize:28,fontWeight:500,color:C.bk,letterSpacing:6,textTransform:"uppercase"}}>Project B</div>
    </div>
    <div style={{maxWidth:560,margin:"48px auto",padding:"0 24px",textAlign:"center"}}>
      <div style={{fontSize:14,color:C.gr,lineHeight:2}}>
        We create everyday objects that bring quiet joy. Each piece in our collection is designed with intention and crafted by hand, celebrating imperfection as beauty. Our studio believes that the objects we surround ourselves with shape our daily experience.
      </div>
    </div>
    <div style={{maxWidth:800,margin:"48px auto",padding:"0 24px",display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
      {["Designed with care","Made by hand","Built to last"].map(t=>(
        <div key={t} style={{background:C.ow,height:200,display:"flex",alignItems:"flex-end",padding:20}}>
          <div style={{fontSize:14,fontWeight:500,color:C.bk}}>{t}</div>
        </div>
      ))}
    </div>
  </div>
);

const StorePage=({setPage})=>(
  <div>
    <div style={{height:280,background:C.bk,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
      <div style={{fontSize:10,letterSpacing:4,textTransform:"uppercase",color:C.si}}>Offline store</div>
      <div style={{fontSize:24,fontWeight:500,color:C.sn,letterSpacing:4,textTransform:"uppercase"}}>Visit us</div>
    </div>
    <div style={{maxWidth:800,margin:"0 auto",padding:"48px 24px"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:40}}>
        <div style={{background:C.ow,height:300,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:C.si}}>
          Map / store photo
        </div>
        <div>
          <div style={{fontSize:11,letterSpacing:2,textTransform:"uppercase",color:C.si,marginBottom:16}}>Store info</div>
          {[["Address","(Store address here)"],["Hours","Mon–Sat 11:00–20:00"],["Closed","Sunday & holidays"],["Phone","010-0000-0000"],["KakaoTalk","@projectb"]].map(([l,v])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${C.ow}`,fontSize:13}}>
              <span style={{color:C.si}}>{l}</span>
              <span style={{color:C.bk,fontWeight:500}}>{v}</span>
            </div>
          ))}
          <div style={{marginTop:24,display:"flex",gap:8}}>
            <button style={{flex:1,padding:"12px",background:C.bk,color:C.sn,border:"none",fontSize:11,letterSpacing:1.5,textTransform:"uppercase",cursor:"pointer"}}>Get directions</button>
            <button style={{flex:1,padding:"12px",background:"transparent",color:C.bk,border:`1.5px solid ${C.bk}`,fontSize:11,letterSpacing:1.5,textTransform:"uppercase",cursor:"pointer"}}>KakaoTalk</button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function ProjectBWireframe(){
  const[page,setPage]=useState("home");
  return(
    <div style={{background:C.sn,minHeight:"100vh",fontFamily:"system-ui,-apple-system,sans-serif"}}>
      <Nav page={page} setPage={setPage}/>
      {page==="home"&&<HomePage setPage={setPage}/>}
      {page==="shop"&&<ShopPage setPage={setPage}/>}
      {page==="detail"&&<DetailPage setPage={setPage}/>}
      {page==="cart"&&<CartPage setPage={setPage}/>}
      {page==="brand"&&<BrandPage/>}
      {page==="store"&&<StorePage setPage={setPage}/>}
      <Footer/>
    </div>
  );
}
