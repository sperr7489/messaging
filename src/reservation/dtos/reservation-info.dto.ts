import { UserDto } from '../../crawler/dtos/user.dto';
import { SpaceDto } from '../../crawler/dtos/space.dto';
export class ReservationInfo {
  user: UserDto;
  tagReservation?: string;
  dateReservation?: string;
  spaceDto: SpaceDto;
  reservationNum?: number;
  price?: string;

  constructor(
    user: UserDto,
    tagReservationInput: string,
    dateReservationInput: string,
    spaceDto: SpaceDto,
    reservationNumInput: number,
    priceInput: number,
  ) {
    this.user = user;
    this.tagReservation = tagReservationInput;
    this.dateReservation = dateReservationInput;
    this.spaceDto = spaceDto;
    this.reservationNum = reservationNumInput;
    this.price = String(priceInput);
  }
}
