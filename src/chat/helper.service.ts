export class HelperService {
  static querify(obj: object): string {
    let str = '';
    Object.keys(obj).forEach((key) => {
      if (str !== '') {
        str += '&';
      }
      str += key + '=' + encodeURIComponent(obj[key]);
    });
    return str;
  }

  static Objectify(str: string): object {
    const urlParams = new URLSearchParams(str);
    const entries = urlParams.entries();
    const params = this.paramsToObject(entries);
    return params;
  }

  static paramsToObject(entries) {
    const result = {};
    for (const entry of entries) { // each 'entry' is a [key, value] tupple
      const [key, value] = entry;
      result[key] = value;
    }
    return result;
  }
}
