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
    reservationNumInput: string,
    priceInput: string,
  ) {
    try {
      const userName =
        typeof nameInput === 'string' ? nameInput.match(/예약자명(.+)$/) : null;
      const phoneNumber =
        typeof phoneNumberInput === 'string'
          ? phoneNumberInput.match(/전화번호(.+)$/)
          : null;

      const tagReservation = tagReservationInput ?? null;
      const dateReservation =
        typeof dateReservationInput === 'string'
          ? dateReservationInput.match(/날짜\/시간(.+)$/)
          : null;
      const placeDescription =
        typeof placeReservationInput === 'string'
          ? placeReservationInput.match(/예약공간(.+)$/)
          : null;
      const reservationNum =
        typeof reservationNumInput === 'string'
          ? reservationNumInput.match(/예약번호(.+)$/)
          : null;
      const price =
        typeof priceInput === 'string' ? priceInput.match(/가격(.+)$/) : null;

      this.userName = userName ? userName[1] : '';
      this.phoneNumber = phoneNumber ? phoneNumber[1] : '';
      this.tagReservation = tagReservation ?? '';
      this.dateReservation = dateReservation ? dateReservation[1] : '';
      this.placeDescription = placeDescription ? placeDescription[1] : '';
      this.reservationNum = reservationNum ? Number(reservationNum[1]) : 0;
      this.price = price ? price[1] : '';
    } catch (error) {
      console.log(error);
    }
  }
  displayInfo(): void {
    console.log(
      `name: ${this.userName}, phoneNumber: ${this.phoneNumber}, tagReservation: ${this.tagReservation}, dateReservation: ${this.dateReservation}, placeDescription: ${this.placeDescription}, reservationNum: ${this.reservationNum}, price : ${this.price}`,
    );
  }
}
