import { filepaths } from '../../.vitepress/utils.mjs'

export default {
  paths() {
    let path = filepaths('./.vitepress/components/tools/picTools')
    //console.log(path);
    return path;
  }
}