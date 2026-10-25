// sweetalert2/dist/sweetalert2.esm.js tidak membawa deklarasi tipe sendiri.
// Paket hanya mengekspos tipe untuk entry "sweetalert2", jadi kita petakan.
declare module "sweetalert2/dist/sweetalert2.esm.js" {
  export { default } from "sweetalert2";
}
