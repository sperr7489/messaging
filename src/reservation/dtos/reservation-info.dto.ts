export class ReservationInfo {
  userName?: string;
  phoneNumber?: string;
  tagReservation?: string;
  dateReservation?: string;
  placeDescription?: string;
  reservationNum?: number;
  price?: string;

  constructor(
    nameInput: string,
    phoneNumberInput: string,
    tagReservationInput: string,
    dateReservationInput: string,
    placeReservationInput: string,
    reservationNumInput: number,
    priceInput: number,
  ) {
    this.userName = nameInput;
    this.phoneNumber = phoneNumberInput;
    this.tagReservation = tagReservationInput;
    this.dateReservation = dateReservationInput;
    this.placeDescription = placeReservationInput;
    this.reservationNum = reservationNumInput;
    this.price = String(priceInput);
  }
}
