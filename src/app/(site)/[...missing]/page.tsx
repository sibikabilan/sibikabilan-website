import { notFound } from "next/navigation";

/**
 * Any address that matches nothing gets the site's own 404 (with its nav,
 * footer and a single, noindexed title) instead of the bare framework page.
 */
export default function Missing() {
  notFound();
}
