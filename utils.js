import {isAbsolute, resolve} from 'node:path';
 /**
  * function creates absolute path to file from given path
  * @arg currDir current directory
  * @arg pathName given path
  **/
export const getPath = ( currDir, pathName) =>  isAbsolute(pathName) ? pathName : resolve(currDir, pathName);