// Rebuild the catalogue from the reviewed Facebook asset bundle.
// Usage: node scripts/import-art.mjs <browser-assets-directory>
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.argv[2];
if (!root) throw new Error("Supply the directory containing downloaded artwork bundles.");
const hashes = "01155a73c964051f 7a97ec489c3d5684 08508248961cdefc 153c610c1f6ae75b 0d60cd3a3b5ec6b9 96f8ead694460a56 2d65ee9c01d3479a 26d029d47ec41ef5 aa535c71a8bed056 50ed127d33d0ffdc e40f6ed76a46484a 7357c2b4792d2ef9 57df5cbc2ec2c27c 217fc0b96116d0a6 36abd26c98d38355 40baa19b17e31700 e083f42f75d2e799 5e20abbc444ea071 ca37686be579851c 952547d22aa7f539 25f1d36bf7cefdf2 abdef03085bfc0fc 71ed09d17ca76042 89f5b2f9a62c6713 b6bef618123f1dd9 f7dced04c87fa201 2d58497b8d3c1968 b3294c401e02e589 482cd5e375755363 14b261b0601492b6 9531137da73a90ba 24f9bb5428f62b05 8431a4dbf23e8d5b fb0242c90fde9709 b811a4d625431115 ace6ef700947a8c8 d0b13db503593fa8 09628fec2cbbca9d 9502bf2a08c1421a 73ef7f36661c78ac 02b4990ed5d66102 ae9e6fbcfadc9df2 352038012762ba82 98a5aad2408e2592 93b60f8e2720718a ac3c64c5c3c2ef1b 1524a61444927fae 16ee404521f4a9c3".split(" ");
const fbids = "632926855647380 426502619623139 736815624413901 736813651080765 618568679571930 275778083850993 274886207273514 156590929103043 156584235770379 156579912437478 142961253799344 141915083903961 133773271384809 133772691384867 133111284784341 132644071497729 132640404831429 132170828211720 131414174954052 130749738353829 130748481687288 130747855020684 130745851687551 130744718354331 130741611687975 130659065029563 130658025029667 130607308368072 130268275068642 130267801735356 130267361735400 130266885068781 130266355068834 130239481738188 130233345072135 130232831738853 130231781738958 130229581739178 130227828406020 130225231739613 130199925075477 129686181793518 129350115160458 129347305160739 127394872022649 127394808689322 105021430926660 105019997593470 105018807593589".split(" ");
// Image index, title, AUD price, medium, dimensions, category, availability note, alternate views.
// Descriptive titles are used where Ann did not give an explicit title.
const rows = [
  [1,"Blue Macaws",225,"Acrylic on canvas","","Animals","",[7,9,47]],
  [2,"Slip Slop Slap",200,"Acrylic","","Coast & country","",[]],
  [3,"Pelican Landing",200,"Acrylic","","Coast & country","",[]],
  [4,"Ghost Town",225,"Acrylic on board","Framed","Coast & country","",[8,29]],
  [5,"Fantasy Horses, Black and White",250,"Mixed media on canvas","","Animals","",[]],
  [6,"Draught Horses and Beer Barrels",250,"Acrylic on canvas","","Animals","Commissioned work; availability must be confirmed.",[]],
  [10,"African Wild Dog",250,"","","Animals","Commissioned work; availability must be confirmed.",[]],
  [11,"Mare and Foal",200,"","","Animals","",[]],
  [13,"Little Ace",150,"","","Animals","Ann has marked this original not for sale.",[26]],
  [15,"Wild Cat in the Reeds",225,"","","Animals","",[45]],
  [16,"Jaguar Fishing",225,"Mixed media","","Animals","",[43]],
  [17,"The Old Holden Ute",225,"","","Coast & country","Ann has marked this original sold.",[]],
  [19,"Country Scene",250,"Acrylic","75 × 75 cm","Coast & country","",[]],
  [20,"Salamander",175,"Enamel","","Animals","",[]],
  [21,"Jazz Groove",225,"","","Colour & imagination","",[]],
  [22,"Beach Fun Time",200,"","","Coast & country","",[]],
  [23,"Pumicestone Passage",225,"","","Coast & country","",[]],
  [24,"Hidden Creatures",225,"","","Colour & imagination","",[]],
  [25,"Rounding up the Brumbies",200,"","","Animals","",[]],
  [27,"Cool and Relaxing Waves",200,"","","Coast & country","",[]],
  [28,"Dreaming Time",225,"Acrylic on board","Framed","Coast & country","",[]],
  [30,"Beautiful Reflections",225,"Acrylic on board","Framed","Coast & country","",[]],
  [31,"Reflections in Green",150,"Acrylic on board","Framed","Coast & country","",[]],
  [32,"Reflections in Blue",150,"","Framed on board","Coast & country","",[]],
  [33,"The Old Country Garage",225,"Acrylic on canvas","","Coast & country","",[]],
  [34,"Wild and Free",200,"Acrylic on canvas","60 × 45 cm","Animals","Ann has marked this original sold.",[]],
  [35,"Aussie Native Flowers",100,"Acrylic on wide-edge canvas","20 × 20 cm","Colour & imagination","Ann has marked this original sold.",[]],
  [36,"Animal Mash",225,"Canvas","60 × 60 cm","Colour & imagination","",[]],
  [37,"White Bird",125,"Gouache and pastels","8 × 10 in; framed","Animals","",[]],
  [38,"City by Night",250,"Canvas","60 × 90 cm","Colour & imagination","",[]],
  [39,"Wild Surf",150,"Canvas","30 × 30 (units not supplied)","Coast & country","",[]],
  [40,"Enamel Fish",125,"Enamel","8 × 10 in","Animals","",[]],
  [41,"Ellie",175,"Canvas","45 × 30 cm","Animals","Painted for Ellie's owner; availability must be confirmed.",[]],
  [42,"Lion's Roar",225,"","","Animals","",[]],
  [44,"Horse in Black and White",175,"","","Animals","",[]],
  [46,"Sunset Surf",200,"","","Coast & country","",[]],
];
const files = await fs.readdir(root,{recursive:true});
const output = path.resolve("public/images/art/gallery");
await fs.mkdir(output,{recursive:true});
const photos = {};
for (const index of rows.flatMap(r=>[r[0],...r[7]])) {
  const file = files.find(f=>path.basename(f) === hashes[index]+".jpg");
  if (!file) throw new Error(`Missing source image ${index}`);
  const dest = path.join(output, fbids[index]+".webp");
  const info = await sharp(path.join(root,file)).rotate().resize({width:1400,height:1400,fit:"inside",withoutEnlargement:true}).webp({quality:85}).toFile(dest);
  photos[index] = {src:`/images/art/gallery/${fbids[index]}.webp`,width:info.width,height:info.height,sourceUrl:`https://www.facebook.com/photo.php?fbid=${fbids[index]}`};
}
const artworks = rows.map(([index,title,price,medium,dimensions,category,note,alternate])=>({
  id:`ann-${fbids[index]}`,title,priceCents:price*100,currency:"AUD",medium,dimensions,category,
  availability:note?"enquiry":"available",note,images:[index,...alternate].map(i=>photos[i]),
}));
await fs.writeFile("content/artworks.mjs",`// Reviewed against Ann's Facebook photos on 14 September 2026.\n// Prices selected within Allen's authorised A$100–A$250 range.\nexport const artworks = ${JSON.stringify(artworks,null,2)};\n`);
console.log(`Imported ${artworks.length} distinct paintings with ${Object.keys(photos).length} photographs.`);
