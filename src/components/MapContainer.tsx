import { useEffect, useRef, useState, useCallback } from 'react';
import * as echarts from 'echarts';
import type { Doctor } from '../data/mockData';

interface MapContainerProps {
  doctors: Doctor[];
  selectedDoctor: Doctor | null;
  userLocation: { lat: number; lng: number } | null;
  locationName?: string;
  onMapClick: (lat: number, lng: number) => void;
  onMarkerClick: (doctor: Doctor) => void;
  onLocationName?: (name: string) => void;
}

// 使用本地 GeoJSON 数据（已打包到项目中，含市县边界）
const GEO_URL = '/china.json';

// 省级颜色映射（用于市级区域着色）
const provinceColorMap: Record<string, string> = {
  '北京': '#d4e8f7', '天津': '#d4e8f7', '河北': '#c8e6c9', '山西': '#dcedc8',
  '内蒙古': '#b2dfdb', '辽宁': '#b3e5fc', '吉林': '#c5cae9', '黑龙江': '#d1c4e9',
  '上海': '#d4e8f7', '江苏': '#c8e6c9', '浙江': '#b2dfdb', '安徽': '#dcedc8',
  '福建': '#b3e5fc', '江西': '#c5cae9', '山东': '#d4e8f7', '河南': '#c8e6c9',
  '湖北': '#b2dfdb', '湖南': '#dcedc8', '广东': '#b3e5fc', '广西': '#c5cae9',
  '海南': '#d1c4e9', '重庆': '#d4e8f7', '四川': '#c8e6c9', '贵州': '#b2dfdb',
  '云南': '#dcedc8', '西藏': '#b3e5fc', '陕西': '#c5cae9', '甘肃': '#d1c4e9',
  '青海': '#d4e8f7', '宁夏': '#c8e6c9', '新疆': '#b2dfdb', '台湾': '#dcedc8',
  '香港': '#b3e5fc', '澳门': '#c5cae9',
};

// 从市级名称推断省份（通过 adcode 前两位）
function getProvinceFromAdcode(adcode: number): string {
  const prefix = Math.floor(adcode / 10000);
  const map: Record<number, string> = {
    11: '北京', 12: '天津', 13: '河北', 14: '山西', 15: '内蒙古',
    21: '辽宁', 22: '吉林', 23: '黑龙江', 31: '上海', 32: '江苏',
    33: '浙江', 34: '安徽', 35: '福建', 36: '江西', 37: '山东',
    41: '河南', 42: '湖北', 43: '湖南', 44: '广东', 45: '广西',
    46: '海南', 50: '重庆', 51: '四川', 52: '贵州', 53: '云南',
    54: '西藏', 61: '陕西', 62: '甘肃', 63: '青海', 64: '宁夏',
    65: '新疆', 71: '台湾', 81: '香港', 82: '澳门',
  };
  return map[prefix] || '';
}

export default function MapContainer({
  doctors, selectedDoctor, userLocation, locationName,
  onMapClick, onMarkerClick, onLocationName,
}: MapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [loadError, setLoadError] = useState('');
  const geoJsonRef = useRef<any>(null);

  // 加载GeoJSON（多源容错）
  useEffect(() => {
    let destroyed = false;

    const loadGeoJson = async (): Promise<any> => {
      if (geoJsonRef.current) return geoJsonRef.current;
      try {
        const resp = await fetch(GEO_URL);
        if (resp.ok) {
          const json = await resp.json();
          geoJsonRef.current = json;
          return json;
        }
      } catch (e) {
        console.warn('本地 GeoJSON 加载失败:', e);
      }
      throw new Error('GeoJSON 加载失败');
    };

    const init = async () => {
      if (!containerRef.current) return;

      let geoJson: any;
      try {
        geoJson = await loadGeoJson();
      } catch (e) {
        console.error('GeoJSON加载失败:', e);
        setLoadError('地图数据加载失败，请检查网络连接');
        return;
      }

      if (destroyed) return;

      // 初始化ECharts
      if (chartRef.current) chartRef.current.dispose();
      const chart = echarts.init(containerRef.current);
      chartRef.current = chart;

      echarts.registerMap('china', geoJson);

      // 构建市县区域颜色（按省份分组着色）
      const regions = (geoJson.features || []).map((f: any) => {
        const name = f.properties?.name || '';
        const adcode = f.properties?.adcode || 0;
        const province = getProvinceFromAdcode(adcode);
        const baseColor = provinceColorMap[province] || '#e8f0fe';
        return {
          name,
          itemStyle: {
            areaColor: baseColor,
            borderColor: '#a0b8d0',
            borderWidth: 0.5,
          },
          emphasis: {
            itemStyle: { areaColor: '#90caf9' },
            label: { show: true, color: '#fff', fontWeight: 'bold', fontSize: 10 },
          },
        };
      });

      chart.setOption({
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderColor: '#ddd',
          borderWidth: 1,
          textStyle: { color: '#333', fontSize: 13 },
          formatter: (p: any) => {
            if (p.seriesType === 'scatter' && p.data) {
              return `<div style="padding:4px"><strong>${p.data.name}</strong><br/><span style="color:#666;font-size:12px">${p.data.title || ''}</span></div>`;
            }
            return p.name || '';
          },
        },
        geo: {
          map: 'china',
          roam: true,
          zoom: 1.15,
          center: [104, 36],
          label: { show: false, fontSize: 8, color: '#5a7a96' },
          emphasis: {
            label: { show: true, color: '#fff', fontWeight: 'bold' },
            itemStyle: { areaColor: '#90caf9' },
          },
          itemStyle: {
            borderColor: '#8ab4d6',
            borderWidth: 0.8,
            areaColor: '#e8f0fe',
          },
          regions,
        },
        series: [],
      }, true);

      // 点击地图区域 → 设置位置
      chart.on('click', (params: any) => {
        if (params.seriesType === 'scatter' && params.data) {
          // 点击了标记点 → 打开详情
          const doc = doctors.find((d) => d.name === params.data.name);
          if (doc) onMarkerClick(doc);
        } else if (params.componentType === 'geo') {
          // 点击了市县区域 → 设置位置
          const adcode = params.data?.adcode || 0;
          const province = getProvinceFromAdcode(adcode);
          const cityName = params.name || '';
          if (onLocationName) {
            onLocationName(province ? province + ' ' + cityName : cityName);
          }
          // 获取区域中心坐标
          const feature = (geoJson.features || []).find(
            (f: any) => f.properties?.name === params.name
          );
          if (feature) {
            const coords = feature.properties?.centroid || feature.properties?.center;
            if (coords && Array.isArray(coords) && coords.length === 2) {
              onMapClick(coords[1], coords[0]);
            }
          }
        }
      });

      setMapReady(true);

      const handleResize = () => chart.resize();
      window.addEventListener('resize', handleResize);

      return () => {
        destroyed = true;
        window.removeEventListener('resize', handleResize);
        chart.dispose();
        chartRef.current = null;
      };
    };

    init();
  }, []);

  // 大头针 SVG 图片（正方形 viewBox，直立，针身长）
  const createPushpinSVG = (color: string) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
      <circle cx="20" cy="10" r="8" fill="${color}"/>
      <circle cx="17" cy="7" r="2.5" fill="rgba(255,255,255,0.45)"/>
      <rect x="18.5" y="17" width="3" height="16" rx="1.5" fill="#b0b0b0"/>
      <rect x="19.2" y="19" width="1" height="12" rx="0.5" fill="rgba(255,255,255,0.35)"/>
      <polygon points="18.5,33 21.5,33 20,38" fill="#888"/>
    </svg>`;
    return `image://data:image/svg+xml,${encodeURIComponent(svg)}`;
  };

  // 更新标记点
  const updateMarkers = useCallback(() => {
    if (!chartRef.current || !mapReady) return;

    // 搜索结果标记点（蓝色大头针）
    const scatterData = doctors
      .filter((doc) => doc && doc.location_lat && doc.location_lng)
      .map((doc) => ({
        name: doc.name,
        value: [doc.location_lng, doc.location_lat],
        title: `${doc.title || ''} | ${doc.hospital || ''}`,
        symbol: createPushpinSVG('#1565c0'),
      }));

    // 用户位置标记（红色大头针，醒目）
    const userScatter = userLocation
      ? [{
          name: '我的位置',
          value: [userLocation.lng, userLocation.lat],
          title: locationName || '当前位置',
          symbol: createPushpinSVG('#e53935'),
        }]
      : [];

    chartRef.current.setOption({
      series: [
        {
          type: 'scatter',
          coordinateSystem: 'geo',
          data: [...scatterData, ...userScatter],
          symbolSize: 36,
          label: {
            show: true,
            formatter: (p: any) => p.data?.name || '',
            position: 'right',
            fontSize: 11,
            color: '#333',
            backgroundColor: 'rgba(255,255,255,0.85)',
            padding: [2, 6],
            borderRadius: 4,
          },
          emphasis: {
            scale: true,
            itemStyle: { shadowBlur: 8, shadowColor: 'rgba(0,0,0,0.25)' },
          },
          zlevel: 1,
        },
      ],
    }, { notMerge: false });
  }, [doctors, userLocation, mapReady, locationName]);

  useEffect(() => {
    updateMarkers();
  }, [updateMarkers]);

  // 选中医生时定位到该位置
  useEffect(() => {
    if (!selectedDoctor || !chartRef.current || !mapReady) return;
    chartRef.current.setOption({
      geo: {
        center: [selectedDoctor.location_lng, selectedDoctor.location_lat],
        zoom: 5,
      },
    });
  }, [selectedDoctor, mapReady]);

  return (
    <div className="map-wrapper">
      <div ref={containerRef} className="map-container" />
      {!mapReady && !loadError && (
        <div className="map-loading">
          <div className="loading-spinner" />
          <span>地图加载中...</span>
        </div>
      )}
      {loadError && (
        <div className="map-loading" style={{ color: '#ff4d4f' }}>
          <span>{loadError}</span>
          <button onClick={() => window.location.reload()} style={{ marginTop: 8, padding: '4px 12px', cursor: 'pointer' }}>
            重新加载
          </button>
        </div>
      )}
      {mapReady && !userLocation && (
        <div className="map-tip">点击地图上的省份设置你的所在地</div>
      )}
    </div>
  );
}
