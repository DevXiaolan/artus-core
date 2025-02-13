
import { Constructable, Container } from '@artus/injection';
import { EXCEPTION_FILTER_DEFAULT_SYMBOL, EXCEPTION_FILTER_MAP_INJECT_ID } from './constant';
import { ArtusStdError } from './impl';
import { ExceptionFilterMapType, ExceptionFilterType } from './types';

export const matchExceptionFilterClazz =  (err: Error, container: Container): Constructable<ExceptionFilterType> | null => {
  const filterMap: ExceptionFilterMapType = container.get(EXCEPTION_FILTER_MAP_INJECT_ID, {
    noThrow: true,
  });
  if (!filterMap) {
    return null;
  }
  let targetFilterClazz: Constructable<ExceptionFilterType> | null = null;
  if (err instanceof ArtusStdError && filterMap.has(err.code)) {
    // handle ArtusStdError with code simply
    targetFilterClazz = filterMap.get(err.code);
  } else if (filterMap.has(err['constructor'] as Constructable<Error>)) {
    // handle CustomErrorClazz
    targetFilterClazz = filterMap.get(err['constructor'] as Constructable<Error>);
  } else if (filterMap.has(EXCEPTION_FILTER_DEFAULT_SYMBOL)) {
    // handle default ExceptionFilter
    targetFilterClazz = filterMap.get(EXCEPTION_FILTER_DEFAULT_SYMBOL);
  }
  return targetFilterClazz;
};

export const matchExceptionFilter = (err: Error, container: Container): ExceptionFilterType | null => {
  const filterClazz = matchExceptionFilterClazz(err, container);
  
  // return the instance of exception filter
  return filterClazz ? container.get(filterClazz) : null;
};
