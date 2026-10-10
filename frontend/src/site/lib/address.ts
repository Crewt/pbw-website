// Practice address. Not part of the CMS (Admin → Kontakt holds e-mail, phone
// and social links only), so it is fixed here; mirrors ADDRESS in
// src/seo/meta.ts. E-mail and phone always come from the CMS.
export const ADDRESS = { street: "Düppelstraße 9c", zip: "56179", city: "Vallendar" };
export const ADDRESS_LINE = `${ADDRESS.street}, ${ADDRESS.zip} ${ADDRESS.city}`;

// tel: URI for a phone number as typed in the CMS ("+49 (0) 261 …" -> "+49261…").
export function telHref(phone: string): string {
  return `tel:${phone.replace(/\(0\)|[^\d+]/g, "")}`;
}
