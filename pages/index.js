import * as React from 'react';
import * as d3 from 'd3';
import { Element } from 'react-faux-dom';
import DataFetcher from '../DataFetcher.js';

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function toRGB(str) {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
      hash = hash & hash;
  }
  let rgb = [0, 0, 0];
  for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 255;
      rgb[i] = value;
  }
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

class Viz extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      subredditPostCount: props.subredditPostCount
    }
  }

  drawChart() {
    let keys = Object.keys(this.state.subredditPostCount);
    let pairs = Array(keys.length);
    for(let i=0; i < pairs.length; i++) {
      const currKey = keys[i];
      pairs[i] = [currKey, this.state.subredditPostCount[currKey]];
    }
    pairs.sort((pair1, pair2) => (pair2[1] - pair1[1]));
    let counts = [];
    keys = []
    for(let p=0; p < pairs.length; p++) {
      keys.push  ( pairs[p][0] );
      counts.push( pairs[p][1] );
    }
    const barHeight = 30;
    const widthPerPost = 20;
    const yOffset = 30;
    const width = 800;
    const height = keys.length * barHeight;

    const el = new Element('div');
    const svg = d3.select(el)
      .append('svg')
      .attr('id', 'chart')
      .attr('width', width)
      .attr('height', height)
    svg.selectAll("rect")
      .data(counts)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", (d, i) => i * yOffset)
      .attr("height", barHeight)
      .attr("width", (d, i) => d*widthPerPost)
      .attr("fill", (d, i) => toRGB(keys[i]));
    svg.selectAll("text")
      .data(keys)
      .enter()
      .append("text")
      .attr("x", (d, i) => 10 + counts[i]*widthPerPost)
      .attr("y", (d, i) => i * yOffset + (yOffset/2))
      .text((d, i) => d)

    return el.toReact();
  }

  render() {
    return (
      <div>
        {this.drawChart()}
      </div>
    )
  }
}


export default class extends React.Component {
  constructor(props) {
    super(props);
    this.dataFetcher = new DataFetcher(3000 /* 3 seconds in miliseconds */),
    this.state = {
      subredditPostCount: {}
    }
  }

  startUpdates() {
    this.dataFetcher.toRepeat((updatedCount) => {
      // avoid setting state on an unmounted component
      if(this.state.isMounted){
        this.setState({
          subredditPostCount: updatedCount,
        })
      }
    }, 1000 /* timeout in ms */);
  }

  componentDidMount() {
    this.setState({
      isMounted: true
    }, () => this.startUpdates())
  }

  componentWillUnmount() {
    this.setState({
      isMounted: false
    })
  }

  render() {
    return (
      <div>
        <Viz subredditPostCount={this.dataFetcher.subredditPostCount}/>
      </div>
    )
  }
}

