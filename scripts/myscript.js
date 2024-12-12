const margin = { top: 20, right: 20, bottom: 30, left: 40 };
const width = 960 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const svg = d3.select("#plot")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const url = "https://raw.githubusercontent.com/AylmerGit/Broadway/refs/heads/main/scripts/d3data.json"; // Replace with your actual URL

let selectedTheater = "All";

function createChart(data) {
  // Filter data based on selected theater
  const filteredData = selectedTheater === "All"
    ? data
    : data.filter(d => d.Show_Theatre === selectedTheater);

  // Group data by year and calculate averages
  const groupedData = d3.group(filteredData, d => d.Year);
  const averageData = Array.from(groupedData, ([year, yearData]) => ({
    Year: year,
    Attendance: d3.mean(yearData, d => d.Attendance),
    Total_Capacity: d3.mean(yearData, d => d.Total_Capacity),
    AttendanceProportion: d3.mean(yearData, d => d.Attendance) / d3.mean(yearData, d => d.Total_Capacity) 
  }));

  // Prepare data for stacking
  const keys = ["AttendanceProportion", "RemainingCapacity"];
  const stackedData = d3.stack()
    .keys(keys)
    (averageData.map(d => ({
      Year: d.Year,
      AttendanceProportion: d.AttendanceProportion,
      RemainingCapacity: 1 - d.AttendanceProportion 
    })));

  // Create scales
  const x = d3.scaleBand()
    .domain(averageData.map(d => d.Year))
    .range([0, width])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, 1]) // Set domain to 0 to 1 for proportions
    .nice()
    .range([height, 0]); 

  // Create and fill the bars
  const bars = svg.selectAll(".series")
    .data(stackedData); 

  bars.enter()
    .append("g")
    .attr("class", "series")
    .attr("fill", (d, i) => i === 0 ? "steelblue" : "lightblue") 
    .selectAll("rect")
    .data(d => d)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.data.Year))
    .attr("y", d => y(d[1]))
    .attr("height", d => y(d[0]) - y(d[1]))
    .attr("width", x.bandwidth());

  bars.exit().remove(); 

  // Update existing bars
  bars.selectAll("rect")
    .data(d => d)
    .join("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.data.Year))
    .attr("y", d => y(d[1]))
    .attr("height", d => y(d[0]) - y(d[1]))
    .attr("width", x.bandwidth());

  // Add axes
  svg.select(".x-axis")
    .transition()
    .duration(500)
    .call(d3.axisBottom(x));

  svg.select(".y-axis")
    .transition()
    .duration(500)
    .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(".0%"))); // Format y-axis ticks as percentages

  // Add or update axes if they don't exist
  if (svg.selectAll(".x-axis").empty()) {
    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));
  }

  if (svg.selectAll(".y-axis").empty()) {
    svg.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(".0%"))); 
  }
}

d3.json(url).then(data => {
  // Get unique theater names
  const uniqueTheaters = Array.from(new Set(data.map(d => d.Show_Theatre)));

  // Populate the dropdown
  const selectElement = document.getElementById("theaterSelect");
  uniqueTheaters.forEach(theater => {
    const option = document.createElement("option");
    option.value = theater;
    option.text = theater;
    selectElement.appendChild(option);
  });

  createChart(data); 

  // Event listener for dropdown selection
  selectElement.addEventListener("change", () => {
    selectedTheater = selectElement.value;
    createChart(data); 
  });
});