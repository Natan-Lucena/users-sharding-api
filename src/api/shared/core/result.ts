type Success<T> = { ok: true; value: T };
type Error<E> = { ok: false; error: E };

export type Result<T, E> = Success<T> | Error<E>;

export const success = <T>(value: T): Success<T> => {
  return {
    ok: true,
    value,
  };
};

export const failure = <E>(error: E): Error<E> => {
  return {
    ok: false,
    error,
  };
};
