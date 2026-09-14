import PaymentReview from "../../../components/PaymentReview";
export const metadata = {title:"Review your payment · Ann Gillon",robots:{index:false,follow:false}};
export default async function ReturnPage({searchParams}) {
  const query = await searchParams;
  const token = typeof query.token === "string" && /^[A-Z0-9]{10,32}$/.test(query.token) ? query.token : "";
  return <main className="wrap checkout-wrap"><PaymentReview token={token} /></main>;
}
