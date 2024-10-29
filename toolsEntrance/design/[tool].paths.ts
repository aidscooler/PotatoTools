import { filepaths } from '../../.vitepress/utils.mjs'

export default {
  paths() {
    let path = filepaths('./.vitepress/components/tools/designTools')
    //console.log(path);
    return path;
  }
}