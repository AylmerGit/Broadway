// Stacked Bar Chart of Attendance Proportion by Year 

const margin = { top: 20, right: 20, bottom: 50, left: 60 };
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

// Add axes and labels outside the function
const xAxis = svg.append("g")
  .attr("class", "x-axis")
  .attr("transform", `translate(0,${height})`);

const yAxis = svg.append("g")
  .attr("class", "y-axis");

const yAxisLabel = svg.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - margin.left) 
  .attr("x", 0 - (height / 2))
  .attr("dy", "1em")
  .style("text-anchor", "middle")
  .text("Proportion of the Theater Filled");

const xAxisLabel = svg.append("text")
  .attr("x", width / 2)
  .attr("y", height + margin.top + 30) 
  .attr("text-anchor", "middle")
  .text("Year");

const chartTitle = svg.append("text")
  .attr("x", width / 2)
  .attr("y", -(margin.top / 2)+5.5) // Adjust y position as needed
  .attr("text-anchor", "middle")
  .style("font-size", "22px") 
  .text("Average Proportion of the Theater Filled by Year"); 

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
    .domain([0, 1]) 
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

  // Update axes
  xAxis.transition()
    .duration(500)
    .call(d3.axisBottom(x));

  yAxis.transition()
    .duration(500)
    .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(".0%"))); 

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



const selectElement = document.getElementById("theaterSelect");

const textElement1 = document.createElement("p");
textElement1.id = "graphText1";
textElement1.textContent = "After having explored the financial side of the musical/play discrepancy, and seeing that it seems to be mostly impacted by the venues that those two types of shows tend to occupy, it got us to turn our attention back to the venues themselves. For fun, and for insight into just how full most theatres got on average, we took to looking at the attendance as a percentage of capacity on average over time. We figured we wouldn't get much insight aggregating it all together, as individual theatres' attendances vary wildly - so, we decided to make an interactive graph that would let us see this average attendance by year for each of the 41 Broadway theatres by selecting them by name. We figured this would be the best choice of an interactive chart for us, as otherwise we would be faceting by the theatres, and it is hard to both read and present 40+ graphs all at once.";

const textElement2 = document.createElement("p");
textElement2.id = "graphText2";
textElement2.textContent = "From here, we gather some interesting insights, though mostly individualized by theatre. In general, we see that theaters tend to be fairly full on average (upon visual inspection, perhaps around a 60% average in general?), but not typically completely full barring a few exceptions. And speaking of these exceptions, we also noticed something else; in looking at the theatres individually, you can actually see when certain high Broadway shows began their run and/or exploded in popularity with marked jumps in attendance to capacity ratios. For example, the show Wicked (playing at the Gershwin) began its run in late 2003, and is still running to this day; taking a look at the attendance chart for the Gershwin, you can see that attendance spikes in the year 2004 and holds steady above 90% for the remainder of the data available, reflecting its status as an iconic and successful show.Further, you can see a spike in 2011 onward in the Eugene O'Neill theater reflecting the beginning and continuation of the Book of Mormon's run.";

textElement1.style.fontFamily = "sans-serif"; 
textElement2.style.fontFamily = "sans-serif"; 

selectElement.after(textElement1);
selectElement.after(textElement2); 
textElement1.style.color = "black"; 
textElement2.style.color = "black"; 
