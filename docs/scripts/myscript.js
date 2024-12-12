fetch('d3data.json') 
  .then(response => response.json())
  .then(data => {
    console.log("Fetched Data:", data); 

    if (data && data.length > 0) { 
      console.log("Data loaded successfully!"); 

      const myData = data; 
      let currentData = myData; 

      const stack = d3.stack()
        .keys(['Attendance', 'Capacity']);

      createChart(currentData); 

      d3.select("#toggleTheater").on("click", function() {
        currentData = currentData.length === myData.length ? 
          myData.filter(d => d.Show_Theatre === "Theater A") : myData; 
        createChart(currentData);
      });

      function createChart(data) {
        const width = 600, height = 400;

        d3.select("#plot").selectAll("*").remove();

        const svg = d3.select("#plot").append("svg")
          .attr("width", width)
          .attr("height", height);

        const x = d3.scaleBand()
          .domain(data.map(d => d.Year))
          .range([0, width])
          .padding(0.1);

        const yMax = d3.max(data, d => Math.max(d.Attendance, d.Capacity)); 
        const y = d3.scaleLinear()
          .domain([0, yMax])
          .range([height, 0]);

        const color = d3.scaleOrdinal()
          .domain(['Attendance', 'Capacity'])
          .range(["steelblue", "orange"]);

        const series = stack(data);

        svg.selectAll(".serie")
          .data(series)
          .enter().append("g")
          .attr("class", "serie")
          .style("fill", d => color(d.key))
          .selectAll("rect")
          .data(d => d)
          .enter().append("rect")
          .attr("x", d => x(d.data.Year))
          .attr("y", d => y(d[1]))
          .attr("height", d => y(d[0]) - y(d[1]))
          .attr("width", x.bandwidth());

        svg.append("g")
          .attr("transform", `translate(0,${height})`)
          .call(d3.axisBottom(x));

        svg.append("g")
          .call(d3.axisLeft(y));
      }
    } else {
      console.error("Error: Data not loaded or empty."); 
    }
  })
  .catch(error => {
    console.error('Error loading data:', error);
  });