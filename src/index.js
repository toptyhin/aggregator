import './style.css';
import noUiSlider from 'nouislider';
import InMap from './map';
import * as echarts from 'echarts';
import $ from "jquery";

import suggestions from 'suggestions-jquery';

// window.$ = $;
let selectedRegions = {
  reg1: false,
  reg2: false,
};

$('#geo1').suggestions(
    {
        token: "09b36502f2fd994fb02fcd541c18b4cbffe47f99",
        type: "ADDRESS",
             onSelect: function(suggestion) {
              console.log(suggestion);
              selectedRegions.reg1 = suggestion.data.region;
              calc();
        },
        onSelectNothing: function() {
          selectedRegions.reg1 = false;
        }
    }

);

$('#geo2').suggestions(
  {
      token: "09b36502f2fd994fb02fcd541c18b4cbffe47f99",
      type: "ADDRESS",
           onSelect: function(suggestion) {
            console.log(suggestion);
            selectedRegions.reg2 = suggestion.data.region;
            calc();
      },
      onSelectNothing: function() {
        selectedRegions.reg2 = false;
      }
  }

);

const getActiveFuel = () => document.querySelector('#calc .button-block button.active').dataset.ftype;
const hasVat = () =>document.querySelector('#vat_select button.active').dataset.vat === '1'

const calc = async () => {
  let str_reg = [];
  let count = 0;
  Object.keys(selectedRegions).map(i=>{
    if (selectedRegions[i] ) {
      str_reg.push('region['+count+']='+encodeURIComponent(selectedRegions[i]));
      count++;
    }
  })
  if (!str_reg.length) {
    return false;
  }
  const region = str_reg.join('&');
  const fuel = getActiveFuel();
  
  const url = 'https://data.inforkom.ru/api/v1/Base/Calculator?'+region+'&fuel='+fuel;

  const calcResponse = await fetch(url);
  const resp = await calcResponse.json();
  
  const amount_l = slider1.noUiSlider.get() * slider2.noUiSlider.get();

  let amounts = {};
  if (hasVat()) {
    amounts = {
      fuel: amount_l*resp.minPrice - amount_l*resp.maxVal - amount_l*resp.minPrice/6 - 500,
      discount: amount_l*resp.maxVal,
      vat: amount_l*resp.minPrice/6,
      manage: 500,
      total: amount_l*resp.minPrice
    };
    chartOptions = {
      series: [
        {data: [
        { value: amounts.fuel, name: 'Расходы на топливо р/мес' },
        { value: amounts.vat, name: 'НДС' },
        { value: amounts.discount, name: 'Скидка на топливо' },
        { value: amounts.manage, name: 'Управление картой' },
        ]}
      ]
    };    
  } else {
    amounts = {
      fuel: amount_l*resp.minPrice - amount_l*resp.maxVal - 500,
      discount: amount_l*resp.maxVal,
      manage: 500,
      total: amount_l*resp.minPrice
    };
    chartOptions = {
      series: [
        {data: [
        { value: amounts.fuel, name: 'Расходы на топливо р/мес' },
        { value: amounts.discount, name: 'Скидка на топливо' },
        { value: amounts.manage, name: 'Управление картой' },
        ]}
      ]
    };        
  }
  

  economyChart.setOption(chartOptions);
  const priceDisplayconfig = {
    style: "currency",
    currency: "RUB",
    currencyDisplay: "symbol",
  };

  document.getElementById('total_fuel').innerHTML = new Intl.NumberFormat('ru-RU',priceDisplayconfig).format(amounts.fuel);
  document.getElementById('total_discount').innerHTML = new Intl.NumberFormat('ru-RU',priceDisplayconfig).format(amounts.discount);
  if (hasVat()) {
    document.getElementById('total_vat').innerHTML = new Intl.NumberFormat('ru-RU',priceDisplayconfig).format(amounts.vat);
  }
  document.getElementById('total_manage').innerHTML = new Intl.NumberFormat('ru-RU',priceDisplayconfig).format(amounts.manage);
  document.getElementById('total_total').innerHTML = new Intl.NumberFormat('ru-RU',priceDisplayconfig).format(amounts.total);
  document.getElementById('total_vat').parentNode.style.display = hasVat() ? 'flex' : 'none';
}

window.toggleMenu = () => document.querySelector('.mobile-menu').classList.toggle('active');
window.btnHandler = (el) => {
    el.parentNode.querySelectorAll('button.btn-block').forEach(b=>{
      b.classList.remove('active');
      el == b && el.classList.toggle('active')
    })
    if ( el.dataset && (el.dataset.vat != 'undefined' || el.dataset.ftype != 'undefined') ) {
      calc();
    }
    
  };

window.menuItemHandler = (el,menu = false) => {
    if (el.dataset.target) {
        const target = document.getElementById(el.dataset.target) || document.querySelector('.b24-form');
        if (target) {
            menu && toggleMenu();
            window.scrollTo({
                top:target.offsetTop - 60,
                behavior: 'smooth'
            })
        
        }
    }

    if (el.dataset.ymevent && typeof ym !== 'undefined') {
        ym(87874450,'reachGoal',el.dataset.ymevent)
    }
}

window.showMap = () => {
    let holder = document.getElementById('map_canvas_holder');
    if (!holder) {
        holder = document.createElement('section');
        holder.id = 'map_canvas_holder';
        document.querySelector('main').appendChild(holder)
        const map = document.createElement('div');
        map.id = 'map_canvas';
        document.querySelector('#map_canvas_holder').appendChild(map)
    } else {
        holder.classList.add('active');
    }
    InMap({
        apiKey: 'fd02c6b0-6362-49ca-bc38-9f074bf537f6',
        parent: 'map_canvas',
        showGaz: false,
        destroy: true,
        mapControlsArray: ["searchControl","routeButtonControl","zoomControl"]
      });   
    setTimeout(()=>{
        holder.classList.add('active');
        document.body.style.overflow='hidden';
    },500)
}

  const slider1 = document.getElementById('slider1');
  const slider2 = document.getElementById('slider2');
  const value = document.getElementById("text");

  noUiSlider.create(slider1, {
    start: [3500],
    connect: [true, false],
    range: {
        'min': 1000,
        'max': 10000
    },
    pips: {
        mode: 'positions',
        values: [5, 20, 35, 50, 65, 80, 95],
    },
    step: 500,
    format: {
      from: function(value) {
            return Math.round(+value);
        },
      to: function(value) {
            return Math.round(+value);
        }
    }
});

noUiSlider.create(slider2, {
    start: [3],
    connect: [true, false],
    range: {
        'min': 0,
        'max': 100
    },
    pips: {
        mode: 'positions',
        values: [5, 20, 35, 50, 65, 80, 95],
    },
    step: 1,
    format: {
      from: function(value) {
            return Math.round(+value);
        },
      to: function(value) {
            return Math.round(+value);
        }
    }
});

const setPassedLabels = (el, val) => {
    el.querySelectorAll('.noUi-value-large').forEach( e=>{
        if (e.dataset.value && parseInt(e.dataset.value) < val) {
            e.previousSibling !== null && e.previousSibling.classList.add('filled')
        } else {
            e.previousSibling !== null && e.previousSibling.classList.remove('filled')
        }
    })
}

const displayValue = (el,val,postfix) => {
    const place = el.parentNode.parentNode.querySelector('.calc-value');
    if (place) {
        place.innerText = new Intl.NumberFormat('ru-RU').format(val[0]) + postfix;
    }
}

slider1.noUiSlider.on('update', (val)=>{
    setPassedLabels(slider1,val)
    displayValue(slider1, val,' Л.')
});
slider2.noUiSlider.on('update', (val)=>{
    setPassedLabels(slider2, val)
    displayValue(slider2, val, ' Авто')
});

const chartDom = document.getElementById('charts');
const economyChart = echarts.init(chartDom);
economyChart.on('mouseover',(e)=>{
  console.log(e)
  economyChart.setOption({
    series: [
      {
        label: {
          show: false,
          position: 'center'
        },        
      }
    ]  
  });
});
economyChart.on('mouseout',(e)=>{
  console.log('out',e)
  economyChart.setOption({
    series: [
      {
        label: {
          show: true,
          position: 'center',
          formatter: '{b}: {c}'
        },        
      }
    ]  
  });
});
let chartOptions = {
  tooltip: {
    trigger: 'item',
    // position: 'inside'
  },
  legend: {
    show: false,
    bottom: '-10%',
    left: 'center',
  },
  series: [
    {
      name: 'Цена топлива',
      type: 'pie',
      radius: ['80%', '95%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: [0,10,0,10],
        borderColor: '#c4c4c4',
        borderWidth: 1
      },
      label: {
        show: true,
        position: 'center'
      },
      emphasis: {
        focus: 'series',
        label: {
          show: true,
          fontSize: '20',
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      color: [
        '#C4C4C4',
        '#049471',
        '#FBA834',
        '#387ADF'
      ],
      data: [
        { value: 0, name: 'Расходы на топливо р/мес' },
        { value: 0, name: 'НДС' },
        { value: 0, name: 'Скидка на топливо' },
        { value: 0, name: 'Управление картой' },
      ]
    }
  ]
};

economyChart.setOption(chartOptions);

window.showResults = () => {
  document.getElementById('calcResult').classList.remove('hidden');
  economyChart.resize();
  // economyChart.dispatchAction({ type: 'highlight', dataIndex: 0 })
}

window.showCalc = () => {
  document.getElementById('calc').classList.remove('hidden');
  economyChart.resize();
}


// (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)}; m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)}) (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym"); ym(87874450, "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true, webvisor:true }); 