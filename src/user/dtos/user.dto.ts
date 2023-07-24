export class User {
  name?: string;
  phoneNumber?: string;
  tagReservation?: string;
  dateReservation?: string;
  placeReservation?: string;
  reservationNum?: string;

  constructor(
    nameInput: string,
    phoneNumberInput: string,
    tagReservationInput: string,
    dateReservationInput: string,
    placeReservationInput: string,
    reservationNumInput: string,
  ) {
    try {
      const name =
        typeof nameInput === 'string' ? nameInput.match(/예약자명(.+)$/) : null;
      const phoneNumber =
        typeof phoneNumberInput === 'string'
          ? phoneNumberInput.match(/전화번호(.+)$/)
          : null;

      const tagReservation = tagReservationInput ?? null;
      const dateReservation =
        typeof phoneNumberInput === 'string'
          ? dateReservationInput.match(/날짜\/시간(.+)$/)
          : null;
      const placeReservation =
        typeof phoneNumberInput === 'string'
          ? placeReservationInput.match(/예약공간(.+)$/)
          : null;
      const reservationNum =
        typeof reservationNumInput === 'string'
          ? reservationNumInput.match(/예약번호(.+)$/)
          : null;
      this.name = name ? name[1] : '';
      this.phoneNumber = phoneNumber ? phoneNumber[1] : '';
      this.tagReservation = tagReservation ?? '';
      this.dateReservation = dateReservation ? dateReservation[1] : '';
      this.placeReservation = placeReservation ? placeReservation[1] : '';
      this.reservationNum = reservationNum ? reservationNum[1] : '';
    } catch (error) {
      console.log(error);
    }
  }
  displayInfo(): void {
    console.log(
      `name: ${this.name}, phoneNumber: ${this.phoneNumber}, tagReservation: ${this.tagReservation}, dateReservation: ${this.dateReservation}, placeReservation: ${this.placeReservation}, reservationNum: ${this.reservationNum}`,
    );
  }
}
