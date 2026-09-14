"use client";
import { useMemo,useState } from "react";
import Link from "next/link";
import { formatPrice } from "../lib/art-catalog.mjs";

const categories = ["All paintings","Animals","Coast & country","Colour & imagination"];
function Painting({ art,state,checkoutEnabled }) {
  const [imageIndex,setImageIndex] = useState(0);
  const image = art.images[imageIndex];
  const enquiry = art.availability !== "available";
  const unavailable = enquiry || state === "sold" || state === "pending";
  const status = state === "sold" ? "Sold" : state === "pending" ? "Payment being confirmed" : enquiry ? "Enquiry only" : "Original painting";
  const message = `Hello Allen, I would like to enquire about ${art.title} (${art.id}), listed at ${formatPrice(art.priceCents)}.`;
  return <article className="painting" id={art.id}>
    <a className="painting-photo" href={image.src} target="_blank" rel="noopener" aria-label={`View ${art.title} at full size`}>
      <img src={image.src} width={image.width} height={image.height} alt={`${art.title}, painting by Ann Gillon${imageIndex ? ", alternate view" : ""}`} loading="lazy" />
    </a>
    {art.images.length > 1 ? <div className="painting-views" aria-label={`Views of ${art.title}`}>
      {art.images.map((img,index)=><button key={img.src} type="button" aria-pressed={index === imageIndex} onClick={()=>setImageIndex(index)}>View {index+1}</button>)}
    </div> : null}
    <div className="painting-caption"><h2>{art.title}</h2>
      <p className="painting-meta">{[art.medium,art.dimensions].filter(Boolean).join(" · ") || "By Ann Gillon"}</p>
      <p className="painting-price">{enquiry ? "Guide price: " : ""}{formatPrice(art.priceCents)}</p>
      <p className="painting-status">{status}</p>
      {art.note ? <p className="painting-note">{art.note}</p> : null}
      {!unavailable && checkoutEnabled && state === "available" ? <Link className="btn" href={`/checkout/${art.id}`}>Buy this painting</Link> :
        <a className="painting-enquire" href={`sms:+61438747882?&body=${encodeURIComponent(message)}`}>Enquire about this painting</a>}
    </div>
  </article>;
}
export default function ArtGallery({ artworks,stock,checkoutEnabled }) {
  const [category,setCategory] = useState("All paintings");
  const [query,setQuery] = useState("");
  const paintings = useMemo(()=>artworks.filter(art=>(category === "All paintings" || art.category === category) &&
    `${art.title} ${art.medium}`.toLowerCase().includes(query.trim().toLowerCase())),[artworks,category,query]);
  return <><div className="gallery-tools">
    <div className="gallery-categories" aria-label="Filter paintings by subject">{categories.map(item=><button type="button" key={item} aria-pressed={item === category} onClick={()=>setCategory(item)}>{item}</button>)}</div>
    <label className="gallery-search">Find a painting<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Title or medium" /></label>
  </div>
  <p className="gallery-count" role="status">{paintings.length} {paintings.length === 1 ? "painting" : "paintings"}{category !== "All paintings" ? ` in ${category.toLowerCase()}` : ""}</p>
  <div className="artgrid">{paintings.map(art=><Painting key={art.id} art={art} state={stock[art.id]} checkoutEnabled={checkoutEnabled} />)}</div>
  {!paintings.length ? <p>No paintings match. Try another title or subject.</p> : null}</>;
}
