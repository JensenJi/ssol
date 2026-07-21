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

// 使用本地 GeoJSON 数据（已打包到项目中）
const GEO_URL = '/china.json';

// 省份颜色映射（匹配参考图的淡蓝/淡绿色调）
const provinceColors: Record<string, string> = {
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

      // 构建省份区域颜色
      const regions = (geoJson.features || []).map((f: any) => {
        const name = f.properties?.name || '';
        return {
          name,
          itemStyle: {
            areaColor: provinceColors[name] || '#e8f0fe',
            borderColor: '#8ab4d6',
            borderWidth: 0.8,
          },
          emphasis: {
            itemStyle: { areaColor: '#90caf9' },
            label: { show: true, color: '#fff', fontWeight: 'bold', fontSize: 11 },
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
            if (p.seriesType === 'effectScatter' && p.data) {
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
          label: { show: true, fontSize: 9, color: '#5a7a96' },
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
        if (params.seriesType === 'effectScatter' && params.data) {
          // 点击了标记点 → 打开详情
          const doc = doctors.find((d) => d.name === params.data.name);
          if (doc) onMarkerClick(doc);
        } else if (params.componentType === 'geo') {
          // 点击了省份区域 → 设置位置
          if (onLocationName) {
            onLocationName(params.name || '');
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

  // 更新标记点
  const updateMarkers = useCallback(() => {
    if (!chartRef.current || !mapReady) return;

    // 搜索结果标记点（蓝色大头针效果）
    const scatterData = doctors
      .filter((doc) => doc && doc.location_lat && doc.location_lng)
      .map((doc) => ({
        name: doc.name,
        value: [doc.location_lng, doc.location_lat],
        title: `${doc.title || ''} | ${doc.hospital || ''}`,
        itemStyle: { color: '#1565c0' },
      }));

    // 用户位置标记（绿色）
    const userScatter = userLocation
      ? [{
          name: '我的位置',
          value: [userLocation.lng, userLocation.lat],
          title: locationName || '当前位置',
          itemStyle: { color: '#2e7d32' },
        }]
      : [];

    chartRef.current.setOption({
      series: [
        {
          type: 'effectScatter',
          coordinateSystem: 'geo',
          data: [...scatterData, ...userScatter],
          symbolSize: 16,
          showEffectOn: 'render',
          rippleEffect: { brushType: 'stroke', scale: 3 },
          label: {
            show: true,
            formatter: (p: any) => p.data?.name || '',
            position: 'right',
            fontSize: 11,
            color: '#333',
            backgroundColor: 'rgba(255,255,255,0.7)',
            padding: [2, 4],
            borderRadius: 3,
          },
          emphasis: {
            scale: true,
            itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.3)' },
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
