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
    let ret = await fetch('http://localhost:3000/api/update');
    const rett = await ret.json();
    console.log(rett);
    this.setState({
      subredditPostCount: rett
    });
    setTimeout(() => this.startUpdates(), 1000);
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
      .text((d, i) => {
        return `${d} (${this.state.subredditPostCount[keys[i]]})`
      })
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
    this.state = {
      subredditPostCount: {}
    }
  }

  render() {
    return (
      <div>
        <h1>Number of posts on /r/popular/new</h1>
        <Viz subredditPostCount={this.state.subredditPostCount}/>
      </div>
    )
  }
}

