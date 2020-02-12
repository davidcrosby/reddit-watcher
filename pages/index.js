import * as React from 'react';
import * as d3 from 'd3';
import { Element } from 'react-faux-dom';
import { toRGB } from '../utils/colors.js';

import fetch from 'isomorphic-unfetch';

class Viz extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      subredditPostCount: props.subredditPostCount
    }
  }

  async startUpdates() {
    let ret = await fetch(`./api/update`);
    const rett = await ret.json();
    console.log(rett);
    this.setState({
      subredditPostCount: rett
    });
    setTimeout(() => this.startUpdates(), 1000);
  }

  componentDidMount() {
    this.setState({
      isMounted: true,
      width: window.innerWidth
    }, () => this.startUpdates())
  }

  componentWillUnmount() {
    this.setState({
      isMounted: false
    })
  }

  getCountsAndKeys() {
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
    return [keys, counts];
  }
  drawChart() {
    let [keys, counts] = this.getCountsAndKeys();
    const width = this.state.width;
    const widthPerPost = width/(3*d3.max(counts));
    const barHeight = 30;
    const height = keys.length * barHeight;
    const yOffset = 30;

    const el = new Element('div');
    const svg = d3.select(el)
      .append('svg')
      .attr('id', 'chart')
      .attr('width', width)
      .attr('height', height)
    svg
      .append('g')
      .selectAll('.bar1')
      .data(counts)
      .enter()
      .append('rect')
      .attr('id', (d, i) => `bar-id-${i}`)
      .attr('x', this.state.width/5)
      .attr('y', (d, i) => i * yOffset)
      .attr('height', barHeight*counts.length)
      .attr('width', width)
      .attr('fill', 'none');
    svg
      .append('g')
      .selectAll('.bar2')
      .data(counts)
      .enter()
      .append('rect')
      .attr('x', this.state.width/5)
      .attr('y', (d, i) => i * yOffset)
      .attr('height', barHeight)
      .attr('width', (d, i) => d*widthPerPost)
      .attr('fill', (d, i) => toRGB(keys[i]));

    const addOffset = (x, i) => calc(x + 10 + counts[i]*widthPerPost);
    svg
      .append('g')
      .attr('class', 'bar-label')
      .selectAll('text')
      .data(keys)
      .enter()
      .append('text')
      .text((d, i) => {
        return `${d} (${this.state.subredditPostCount[keys[i]]})`
      })
      .attr('text-align', 'middle')
      .attr('font', 'helvetica')
      .attr('x', (d, i) => (this.state.width/5) + 10 + counts[i]*widthPerPost)
      .attr('y', (d, i) => i * yOffset + (yOffset/1.5))
    return el.toReact();
  }

  render() {
    let [keys, counts] = this.getCountsAndKeys();
    const msg = `There are ${keys.length} subreddits represented over ${d3.sum(counts)} submissions`;
    const vizHeaderStyle = {
      'position': 'relative',
      'left': '20%'
    }
    return (
      <div>
        <h3 style={vizHeaderStyle}>{msg}</h3>
        {this.drawChart()}
      </div>
    )
  }
}

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      subredditPostCount: {}
    }
  }

  render() {

    const headerStyle = {
      'position': 'absolute', 
      'left': '20%'
    }
    const containerStyle = {
      'position': 'absolute',
      'top': '10%'
    }

    return (
      <div>
        <h1 style={headerStyle}>Number of posts on /r/popular/new</h1>
        <div style={containerStyle}>
          <Viz subredditPostCount={this.state.subredditPostCount}/>
        </div>
      </div>
    )
  }
}

