library(jsonlite)
BroadwayData <- read_csv("Raw_Data/broadway.csv", show_col_types = FALSE)
colnames(BroadwayData) <- c("Day", "Date", "Month","Year","Show_Name","Show_Theatre","Show_Type",
                            "Attendance","Capacity","Gross","Gross_Potential","Performances")
broadway <- BroadwayData |> select(Year,Attendance,Show_Theatre,Capacity) |> 
  mutate(Total_Capacity = ceiling(ifelse(Capacity > 100, Attendance, (Attendance / Capacity)*100)))

broadway <- select(broadway, -Capacity) 

d3data <- toJSON(broadway)

write(d3data, "d3data.json")