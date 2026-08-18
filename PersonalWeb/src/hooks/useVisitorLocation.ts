import { useEffect, useState } from 'react'

export interface VisitorLocation {
  province?: string
  city?: string
  raw: string
}

const PROVINCES: Record<string, string> = {
  anhui: '安徽', beijing: '北京', chongqing: '重庆', fujian: '福建', gansu: '甘肃',
  guangdong: '广东', guangxi: '广西', guizhou: '贵州', hainan: '海南', hebei: '河北',
  heilongjiang: '黑龙江', henan: '河南', hubei: '湖北', hunan: '湖南', inner: '内蒙古',
  jiangsu: '江苏', jiangxi: '江西', jilin: '吉林', liaoning: '辽宁', ningxia: '宁夏',
  qinghai: '青海', shaanxi: '陕西', shandong: '山东', shanghai: '上海', shanxi: '山西',
  sichuan: '四川', tianjin: '天津', tibet: '西藏', xinjiang: '新疆', yunnan: '云南',
  zhejiang: '浙江', taiwan: '台湾', hongkong: '香港', macau: '澳门',
}

const CITIES: Record<string, string> = {
  beijing: '北京', shanghai: '上海', guangzhou: '广州', shenzhen: '深圳', chengdu: '成都',
  hangzhou: '杭州', wuhan: '武汉', xian: '西安', nanjing: '南京', chongqing: '重庆',
  tianjin: '天津', suzhou: '苏州', zhengzhou: '郑州', changsha: '长沙', shenyang: '沈阳',
  qingdao: '青岛', dalian: '大连', jinan: '济南', harbin: '哈尔滨', changchun: '长春',
  fuzhou: '福州', xiamen: '厦门', nanchang: '南昌', hefei: '合肥', kunming: '昆明',
  guiyang: '贵阳', nanning: '南宁', haikou: '海口', shijiazhuang: '石家庄', taiyuan: '太原',
  hohhot: '呼和浩特', lanzhou: '兰州', xining: '西宁', yinchuan: '银川', urumqi: '乌鲁木齐',
  lhasa: '拉萨', zhuhai: '珠海', ningbo: '宁波', wuxi: '无锡', dongguan: '东莞',
  foshan: '佛山', wenzhou: '温州', shantou: '汕头', zhongshan: '中山', huizhou: '惠州',
  jiangmen: '江门', zhanjiang: '湛江', maoming: '茂名', shaoguan: '韶关', jieyang: '揭阳',
  putian: '莆田', quanzhou: '泉州', zhangzhou: '漳州', longyan: '龙岩', sanming: '三明',
  nanping: '南平', yangzhou: '扬州', yancheng: '盐城', xuzhou: '徐州', lianyungang: '连云港',
  huaian: '淮安', taizhou: '泰州', zhenjiang: '镇江', changzhou: '常州', nantong: '南通',
  jiaxing: '嘉兴', huzhou: '湖州', shaoxing: '绍兴', jinhua: '金华', quzhou: '衢州',
  zhoushan: '舟山', taizhouzhe: '台州', luoyang: '洛阳', kaifeng: '开封', anyang: '安阳',
  xinxiang: '新乡', nanyang: '南阳', xuchang: '许昌', pingdingshan: '平顶山',
  baoding: '保定', tangshan: '唐山', qinhuangdao: '秦皇岛', handan: '邯郸', langfang: '廊坊',
  xingtai: '邢台', zhangjiakou: '张家口', cangzhou: '沧州', weifang: '潍坊', yantai: '烟台',
  weihai: '威海', zibo: '淄博', linyi: '临沂', jining: '济宁', taian: '泰安', dezhou: '德州',
  liaocheng: '聊城', heze: '菏泽', binzhou: '滨州', dongying: '东营', zaozhuang: '枣庄',
  rizhao: '日照', mianyang: '绵阳', deyang: '德阳', luzhou: '泸州', yibin: '宜宾',
  nanchong: '南充', daqing: '大庆', mudanjiang: '牡丹江', qiqihar: '齐齐哈尔',
  jilin: '吉林', siping: '四平', tonghua: '通化', yanji: '延吉', huzhouh: '湖州',
  wuhu: '芜湖', bengbu: '蚌埠', maanshan: '马鞍山', anqing: '安庆', huangshan: '黄山',
  fuyang: '阜阳', liuan: '六安', chuzhou: '滁州', xiangyang: '襄阳', yichang: '宜昌',
  jingzhou: '荆州', shiyan: '十堰', huanggang: '黄冈', xiaogan: '孝感', xianning: '咸宁',
  enshi: '恩施', suizhou: '随州', jingmen: '荆门', ezhou: '鄂州', huangshi: '黄石',
  zhuzhou: '株洲', xiangtan: '湘潭', hengyang: '衡阳', yueyang: '岳阳', changde: '常德',
  yiyang: '益阳', chenzhou: '郴州', yongzhou: '永州', huaihua: '怀化', loudi: '娄底',
  zhangjiajie: '张家界', shaoyang: '邵阳', guilin: '桂林', liuzhou: '柳州', wuzhou: '梧州',
  beihai: '北海', fangchenggang: '防城港', qinzhou: '钦州', yulin: '玉林', baise: '百色',
  hechi: '河池', laibin: '来宾', chongzuo: '崇左', hezhou: '贺州', guigang: '贵港',
  liupanshui: '六盘水', zunyi: '遵义', anshun: '安顺', bijie: '毕节', tongren: '铜仁',
  xishuangbanna: '西双版纳', dali: '大理', lijiang: '丽江', qujing: '曲靖', yuxi: '玉溪',
  baoshan: '保山', zhaotong: '昭通', puer: '普洱', lincang: '临沧', chuxiong: '楚雄',
  honghe: '红河', wenshan: '文山', dehong: '德宏', nujiang: '怒江', diqing: '迪庆',
  sanya: '三亚', danzhou: '儋州', wanning: '万宁', wenchang: '文昌', qionghai: '琼海',
  dingan: '定安', tunchang: '屯昌', chengmai: '澄迈', lingao: '临高',
  jiexiu: '介休', gaoxiong: '高雄', taibei: '台北', xinzhu: '新竹', taizhong: '台中',
  tainan: '台南', taoyuan: '桃园', jilong: '基隆', hualian: '花莲', taitung: '台东',
  pingtung: '屏东', yilan: '宜兰', miaoli: '苗栗', zhanghua: '彰化', nantou: '南投',
  yunlin: '云林', jiayi: '嘉义', penghu: '澎湖', lianjiang: '连江', kinmen: '金门',
  hongkong: '香港', macau: '澳门', singapore: '新加坡', tokyo: '东京', osaka: '大阪',
  kyoto: '京都', seoul: '首尔', busan: '釜山', newyork: '纽约', losangeles: '洛杉矶',
  sanfrancisco: '旧金山', london: '伦敦', paris: '巴黎', berlin: '柏林', sydney: '悉尼',
  melbourne: '墨尔本', toronto: '多伦多', vancouver: '温哥华', seattle: '西雅图',
  chicago: '芝加哥', boston: '波士顿', washington: '华盛顿', dubai: '迪拜', bangkok: '曼谷',
  kualalumpur: '吉隆坡', jakarta: '雅加达', manila: '马尼拉', hanoi: '河内', hochiminh: '胡志明市',
}

function zhName(map: Record<string, string>, key: string): string | undefined {
  if (!key) return undefined
  const k = key.trim().toLowerCase().replace(/[\s_]/g, '')
  if (map[k]) return map[k]
  // 拼音连写匹配：如 "nanchang" -> "南昌"
  for (const [en, zh] of Object.entries(map)) {
    if (en === k) return zh
  }
  return undefined
}

function normalizeRegion(region: string): string | undefined {
  if (!region) return undefined
  const r = region.trim()
  // 直接是中文
  if (/[\u4e00-\u9fa5]/.test(r)) return r.replace(/省|市|自治区|特别行政区|壮族|回族|维吾尔/g, '')
  const lower = r.toLowerCase().replace(/[\s_]/g, '')
  // 特殊匹配 Inner Mongolia / Hong Kong 等
  if (lower === 'innermongolia' || lower === 'neimenggu' || lower === 'neimengguzizhiqu') return '内蒙古'
  if (lower === 'hongkong' || lower === 'xianggang') return '香港'
  if (lower === 'macau' || lower === 'macao' || lower === 'aomen') return '澳门'
  if (lower === 'taiwan') return '台湾'
  if (lower === 'xinjiang' || lower === 'xinjiangweiwuerzizhiqu') return '新疆'
  if (lower === 'xizang') return '西藏'
  return zhName(PROVINCES, r)
}

function normalizeCity(city: string): string | undefined {
  if (!city) return undefined
  const c = city.trim()
  if (/[\u4e00-\u9fa5]/.test(c)) return c.replace(/市$/, '')
  return zhName(CITIES, c)
}

const GEO_KEY = 'harbor.visitor.v1'

async function fetchLocation(): Promise<VisitorLocation> {
  const sources = [
    async () => {
      const res = await fetch('https://api.ip.sb/geoip', { headers: { Accept: 'application/json' } })
      if (!res.ok) throw new Error('ip.sb ' + res.status)
      return res.json()
    },
    async () => {
      const res = await fetch('https://ipinfo.io/json')
      if (!res.ok) throw new Error('ipinfo ' + res.status)
      return res.json()
    },
  ]
  for (const source of sources) {
    try {
      const data = await source()
      const province = normalizeRegion(data.region ?? data.province ?? data.state ?? '')
      const city = normalizeCity(data.city ?? '')
      if (province || city) {
        return { province, city, raw: `${province ?? ''}${city ?? ''}` }
      }
    } catch {
      /* 尝试下一个数据源 */
    }
  }
  return { raw: '' }
}

/** 获取访客所在地（省/市），带 sessionStorage 缓存与优雅降级 */
export function useVisitorLocation(): { location: VisitorLocation; loading: boolean } {
  const [location, setLocation] = useState<VisitorLocation>(() => {
    try {
      const cached = sessionStorage.getItem(GEO_KEY)
      if (cached) return JSON.parse(cached) as VisitorLocation
    } catch {
      /* ignore */
    }
    return { raw: '' }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const cached = sessionStorage.getItem(GEO_KEY)
        if (cached) {
          if (!cancelled) {
            setLocation(JSON.parse(cached) as VisitorLocation)
            setLoading(false)
          }
          return
        }
      } catch {
        /* ignore */
      }
      const result = await fetchLocation()
      try {
        sessionStorage.setItem(GEO_KEY, JSON.stringify(result))
      } catch {
        /* ignore */
      }
      if (!cancelled) {
        setLocation(result)
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return { location, loading }
}

export function welcomeText(location: VisitorLocation, fallback = '欢迎来自远方的朋友'): string {
  const parts: string[] = []
  if (location.province) parts.push(`${location.province}省`)
  if (location.city && location.city !== location.province) parts.push(`${location.city}市`)
  return parts.length > 0 ? `欢迎来自 ${parts.join(' ')} 的朋友` : fallback
}