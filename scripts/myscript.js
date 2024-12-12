fetch('https://raw.githubusercontent.com/AylmerGit/Broadway/refs/heads/main/scripts/d3data.json')
  .then(response => response.json())
  .then(data => {
    const myData = data; 
    let currentData = myData; 

    const stack = d3.stack()
      .keys(['Attendance', 'Total_Capacity']); 

    // Create a dropdown for theater selection
    const select = d3.select("body")
      .append("select")
      .attr("id", "theaterSelect");

    // Get unique theater names from the data
    const uniqueTheaters = ["All", ...new Set(myData.map(d => d.Show_Theatre))]; 

    // Create options for the dropdown
    select.selectAll("option")
      .data(uniqueTheaters)
      .enter()
      .append("option")
      .text(d => d)
      .attr("value", d);

    // Initial chart with all theaters
    createChart(currentData);

    // Event listener for dropdown selection
    select.on("change", function() {
      const selectedTheater = this.value;
      currentData = selectedTheater === "All" ? myData : myData.filter(d => d.Show_Theatre === selectedTheater); 
      createChart(currentData);
    });

    function createChart(data) {
      const width = 600, height = 400;
      const margin = { top: 20, right: 20, bottom: 30, left: 40 };

      d3.select("#plot").selectAll("*").remove();

      const svg = d3.select("#plot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const x = d3.scaleBand()
        .domain(data.map(d => d.Year))
        .range([0, width])
        .padding(0.1);

      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.Total_Capacity)]) 
        .range([height, 0]);

      const color = d3.scaleOrdinal()
        .domain(['Attendance', 'Total_Capacity'])
        .range(["steelblue", "orange"]);

      const series = stack(data);

      svg.selectAll(".serie")
        .data(series)
        .enter().append("g")
        .attr("class", "serie")
        .style("fill", d => color(d.key))
        .selectAll("rect")
        .data(d => d) // d here refers to an array of [start, end] values for each stack
        .enter().append("rect")
        .attr("x", (d) => x(d.data.Year)) // Access 'Year' property correctly
        .attr("y", d[1]) 
        .attr("height", d[0] - d[1]) // Use d[0] and d[1] directly
        .attr("width", x.bandwidth());

      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

      svg.append("g")
        .call(d3.axisLeft(y));
    }
  })
  .catch(error => {
    console.error('Error loading data:', error);
  });