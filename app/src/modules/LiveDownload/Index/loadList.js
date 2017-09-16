// @flow
import jQuery from 'jquery';
import cheerio from 'cheerio';
const url = node_require('url');

/**
 * 使用ajax加载列表
 * @param { string } group
 * @param { number } page
 */
export function loadList(group: string, page: number): Promise{
  return new Promise((resolve: Function, reject: Function): void=>{
    jQuery.ajax({
      url: `http://live.${ group.toLocaleLowerCase() }.com/Index/index/p/${ page }.html`,
      type: 'GET',
      dataType: 'text',
      async: true,
      success: function(result: any, status: number, xhr: any): void{
        resolve(result);
      }
    });
  });
}

/**
 * 解析html
 * @param { string } html
 */
export function queryHtml(html: string): Object{
  const xml: any = cheerio.load(html);
  const pageLen: number = Number(xml('.p-skip').text().match(/[0-9]+/g)[0]);
  const videoList: any = xml('.videos');
  const result: Array = [];
  videoList.map((index: number, element: any): void=>{
    const item: any = xml(element);
    const href: string = item.find('a').attr('href');
    const h4: string = item.find('h4').text();
    const p: string = item.find('p').text();
    const id: Array = href.split('/');
    result.push({
      id: id[id.length - 1],
      title: h4,
      secondTitle: p
    });
  });
  return {
    result,
    pageLen: pageLen
  };
}

/**
 * 获取m3u8地址
 * @param { string } group  : 团
 * @param { string } id     : 视频ID
 * @param { string } quality: 品质
 */
export function getM3U8(group: string, id: string, quality: string): Promise{
  return new Promise((resolve: Function, reject: Function): void=>{
    jQuery.ajax({
      url: `http://live.${ group.toLocaleLowerCase() }.com/Index/invedio/id/${ id }`,
      type: 'GET',
      dataType: 'text',
      async: true,
      success: function(result: any, status: number, xhr: any): void{
        resolve(result);
      }
    });
  }).then((html: string): void=>{
    const xml: any = cheerio.load(html);
    return xml(`#${ quality }_url`).attr('value');
  });
}

/**
 * 获取m3u8并解析和下载
 * @param { string } m3u8Url
 */
export function downloadM3U8(m3u8Url: string): Promise{
  return new Promise((resolve: Function, reject: Function)=>{
    jQuery.ajax({
      url: m3u8Url,
      type: 'GET',
      dataType: 'text',
      async: true,
      success: function(result: any, status: number, xhr: any): void{
        resolve(result);
      }
    });
  }).then((text: string): { host: string, m3u8: string }=>{
    /* 使用正则解析网址 */
    const u: string = text.match(/\n[^#\n]*\n/g)[0].replace(/\n/g, '');
    let host: string = null;
    if(/^ht{2}ps?/.test(u)){
      host = '';
    }else if(/^\/.+$/.test(u)){
      const q: Object = url.parse(m3u8Url);
      host = q.protocol + '//' + q.hostname;

    }else{
      host = m3u8Url.replace(/[^/]+\.m3u8/, '');
    }
    return {
      host,
      m3u8: text
    };
  }).then(({ host, m3u8 }: { host: string, m3u8: string }): void=>{
    /* 使用正则替换网址 */
    return m3u8.replace(/\n[^#\n]*\n/g, (str: string): string=>{
      return '\n' + host + str.replace(/\n/g, '') + '\n';
    });
  });
}