import { ReaderVoice } from "../../components/ReaderVoice";

/* Stories, Ann's art and delivery belong to the other site, whose page
   reader prefers a female narrator. W2 replaces this with app/(other)/layout.jsx. */
export default function Layout({ children }) {
  return (
    <>
      <ReaderVoice voice="female" />
      {children}
    </>
  );
}
