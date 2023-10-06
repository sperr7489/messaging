import { SpaceDto } from 'src/crawler/dtos/space.dto';
import { UserDto } from '../../crawler/dtos/user.dto';
export class CrawlDto {
  user: UserDto;
  space: SpaceDto;
  reservationNum: number;
  reservationTag: number;
  spaceExists: number;
}
