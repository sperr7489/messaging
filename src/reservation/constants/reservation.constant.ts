export const OK_RESERVATION = 1; // 예약 확정
export const ALEADY_CANCELED = 0; // 이미 취소환불된것
export const UPDATE_CANCELED = -1; // 예약 확정 => 취소환불로 업데이트
export const CREATE_CANCELED = -2; // 취소 환불이 처음으로 발견되어 reservation 등록, user정보를 업데이트할 필요 없다.
