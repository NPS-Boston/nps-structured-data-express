//upon load do basically 2 things:
//1) ajax the json data
//2) once you get that data, update tags based off their appropriate data-attribute.


//for simplicity this is the minified holiday.js library here https://github.com/NPS-Boston/holidays.js
function isHoliday(t){if(0==t.getMonth()){if(1==t.getDate())return"New Year’s Day";if(1==t.getDay()&&15<=t.getDate()&&t.getDate()<=21)return"Birthday of Martin Luther King, Jr."}if(1==t.getMonth()&&1==t.getDay()&&15<=t.getDate()&&t.getDate()<=21)return"Washington’s Birthday";if(4==t.getMonth()&&1==t.getDay()&&25<=t.getDate()&&t.getDate()<=31)return"Memorial Day";if(6==t.getMonth()&&4==t.getDate())return"Independence Day";if(8==t.getMonth()&&1==t.getDay()&&1<=t.getDate()&&t.getDate()<=7)return"Labor Day";if(9==t.getMonth()&&1==t.getDay()&&8<=t.getDate()&&t.getDate()<=14)return"Columbus Day";if(10==t.getMonth()){if(11==t.getDate())return"Veterans Day";if(4==t.getDay()&&22<=t.getDate()&&t.getDate()<=28)return"Thanksgiving Day"}return 11==t.getMonth()&&25==t.getDate()&&"Christmas Day"}function getNthOfMonth(t,e,a,n){for(var r,g=0;n;)(r=new Date(t,e,++g)).getDay()==a&&n--;return r.getMonth()==e&&r}function getLastOfMonth(t,e,a){for(var n,r=1,g=new Date(t,e+1,0).getDate();r;)(n=new Date(t,e,g--)).getDay()==a&&n.getMonth()==e&&r--;return n}function getHoliday(t,e){if(!t||!e)return!1;switch(t){case"New Year's Day":case"New Year’s Day":return new Date(e,0,1);case"Birthday of Martin Luther King, Jr.":return getNthOfMonth(e,0,1,3);case"Washington's Birthday":case"Washington’s Birthday":return getNthOfMonth(e,1,1,3);case"Memorial Day":return getLastOfMonth(e,4,1);case"Independence Day":return new Date(e,6,1);case"Labor Day":return getNthOfMonth(e,8,1,1);case"Columbus Day":return getNthOfMonth(e,9,1,2);case"Veterans Day":return new Date(e,10,11);case"Thanksgiving Day":return getNthOfMonth(e,10,4,4);case"Christmas Day":return new Date(e,11,25);default:return!1}}

var now = new Date()
var today = now.getDay() + 1	//API/Structured data uses 1-7 convention rather than 0-6
var todayIsHoliday = isHoliday(now)
//console.log(now)

var daysOfWeek = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
var theMonths = ['January','February','March','April','May','June','July','August','September','October','November','December'];
function getUrlParameters(url)
{
	var p = {};
	var paramRegEx = /[\?\&]([A-z]*)[\=]([A-z,\-0-9]*)/g;
	var result = true;
	while(result)
	{
		result = paramRegEx.exec(url);
		if(result)
		{
			p[result[1]] = result[2];
		}
	}
	return p;
}

var parameters = getUrlParameters(document.currentScript.src);
var parks = parameters.park.split(",")
//console.log(parks)

for(var p = 0; p < parks.length; p++)
{
	(function(){
	var park = parks[p];
	jQuery.ajax({
		url:'/' + park + '/structured_data_' + park + '.json',
		success:function(d)
			{
				//console.log(this)
				//console.log(park)
				//structuredData = d;
				loadStructuredData(d,park,
					function(p)
					{
						//console.log(p)
						jQuery.ajax('/' + p + '/nps-alerts-' + p + '.json',{
							success:
								function(d)
								{
									//alertsData = d;
									loadAlertsData(d);
								}
						})
					}
				);
			}
	})
	})()
}

function loadAlertsData(data)
{
	//first priority. hours TODAY based on structured data
	var alerts = jQuery(document).find("[data-alerts]")
	for(var x = 0; x < alerts.length; x++)
	{
		var alertcheck = getAlert(data,alerts[x].getAttribute("data-alerts"));
		if(alertcheck)
		{
			alerts[x].innerHTML = alertcheck;
		}
	}
}

function getAlert(data, str)
{
	var alertString = ""
	for(var x = 0; x < data.CEDATA.length; x++)
	{
		if
		(
			data.CEDATA[x].FIC_title == str
			&&
			(
				new Date(data.CEDATA[x].FIC_end_date.split(" ")[0] + "T23:59:00") >= now
				&&
				now >= new Date(data.CEDATA[x].FIC_start_date.split(" ")[0] + "T00:00:00")
			)
		){
			alertString += data.CEDATA[x].FIC_description;
		}
	}
	return alertString;
}

function loadStructuredData(data,park,callback)
{
	//first priority. hours TODAY based on structured data
	var hoursNow = jQuery(document).find("[data-hours-now]")
	for(var x = 0; x < hoursNow.length; x++)
	{
		var results = getCurrentHours(data, hoursNow[x].getAttribute("data-hours-now"));
		if(results)
		{
			hoursNow[x].innerHTML = results;
		}
	}

	//second, any requests for current season?
	var hoursSeason = jQuery(document).find("[data-hours-current]")
	for(var x = 0; x < hoursSeason.length; x++)
	{
		var results = getCurrentSeason(data, hoursSeason[x].getAttribute("data-hours-current"));
		if(results)
		{
			hoursSeason[x].innerHTML = results;
		}
	}

	//third, any requests for entire season?
	var hoursSeason = jQuery(document).find("[data-hours-season]")
	for(var x = 0; x < hoursSeason.length; x++)
	{
		var results = getSeasonHours(data, hoursSeason[x].getAttribute("data-hours-season"));
		if(results)
		{
			hoursSeason[x].innerHTML = results;
		}
	}
	//forth, load any descriptions about hours
	var hoursDescription = jQuery(document).find("[data-hours-description]")
	for(var w = 0; w < hoursDescription.length; w++)
	{
		for(var x = 0; x < data.operatingHours.length; x++)
		{
			//first find correct site
			if(data.operatingHours[x].operatingScheduleID == hoursDescription[w].getAttribute("data-hours-description"))
			{
				hoursDescription[w].innerHTML = data.operatingHours[x].description;
			}
		}
	}
	//fifth, load up fee requests
	var fees = jQuery(document).find("[data-fees]");
	for(var w = 0; w < fees.length; w++)
	{
		var feeStructure = "<ul>";
		var feeInData = false;
		for(var x = 0; x < data.entranceFees.length; x++)
		{
			if(data.entranceFees[x].title == fees[w].getAttribute("data-fees"))
			{
				feeInData = true;
				feeStructure += "<li>";
				feeStructure += data.entranceFees[x].description + ": ";
				feeStructure += data.entranceFees[x].cost;
				feeStructure += "</li>";
			}
		}
		if(feeInData)
		{
			fees[w].innerHTML = feeStructure + "</ul>";
		}
	}
	callback(park);
}
function getCurrentSeason(structuredData, scheduleID)
{
	for(var x = 0; x < structuredData.operatingHours.length; x++)
	{
		//first find correct site
		if(structuredData.operatingHours[x].operatingScheduleID == scheduleID)
		{
			//we have the correct site based on the database IstructuredData.
			//console.log(structuredData.operatingHours[x].name)
			//now to adjudge if exceptions apply


			//EXCEPTIONS
			if(structuredData.operatingHours[x].exceptions)
			{
				for(var y = 0; y < structuredData.operatingHours[x].exceptions.length; y++)
				{
					//console.log("Testing exception " + structuredData.operatingHours[x].exceptions[y].name)
					//explicit holidays have precedence.
					if(todayIsHoliday && todayIsHoliday == structuredData.operatingHours[x].exceptions[y].holiday_start && todayIsHoliday == structuredData.operatingHours[x].exceptions[y].holiday_end)
					{
						//Single day holiday exception hit
						return "<ul><li>" + structuredData.operatingHours[x].exceptions[y].name + "<ul>" + judgeSeason(structuredData.operatingHours[x].exceptions[y].schedule) + "</ul></li></ul>";
					}
					//other exceptions, last in wins.

					//first clean up the variability between holiday or explicit date start/ends
					var exceptionStart = ""
					if(structuredData.operatingHours[x].exceptions[y].holiday_start != "")
					{
						exceptionStart = getHoliday(structuredData.operatingHours[x].exceptions[y].holiday_start, now.getFullYear())
					}
					else
					{
						exceptionStart = new Date(structuredData.operatingHours[x].exceptions[y].date_start + " " + now.getFullYear())
					}

					var exceptionEnd = ""
					if(structuredData.operatingHours[x].exceptions[y].holiday_end != "")
					{
						exceptionEnd = getHoliday(structuredData.operatingHours[x].exceptions[y].holiday_end, now.getFullYear())
					}
					else
					{
						exceptionEnd = new Date(structuredData.operatingHours[x].exceptions[y].date_end + " " + now.getFullYear())
					}


					if
					(	//if start is a holiday, skip ones where they end with the same holiday. That's above.
						//so accept ones where a holiday start exists and isn't the same holiday as the end
						(
							structuredData.operatingHours[x].exceptions[y].holiday_start != ""
							&&
							structuredData.operatingHours[x].exceptions[y].holiday_start != structuredData.operatingHours[x].exceptions[y].holiday_end
						)
						||
						//and accept all date explicit exceptions.
						structuredData.operatingHours[x].exceptions[y].date_start != ""
					){
						//are we past the start date of exception
						if(now >= exceptionStart)
						{
							//yes we are past the start of exception
							//so look at the exception enstructuredData. Are we under the current calendar year's cutoff?

							if(now <= exceptionEnd)
							{
								//yes we are within the end of the exception this year.
								//EXCEPTION APPLIES!
								return "<ul><li>" + structuredData.operatingHours[x].exceptions[y].name + " (" + theMonths[exceptionStart.getMonth()] + " " + exceptionStart.getDate() + " - " + theMonths[exceptionEnd.getMonth()] + " " + exceptionEnd.getDate() + "):<ul>" + judgeSeason(structuredData.operatingHours[x].exceptions[y].schedule) + "</ul></li></ul>";
							}
							else
							{
								//no we are past the exception enstructuredData. but was the exception end before the exception start?
								//if exception end is lower than start, we need to look to next year as the true end date
								if(exceptionEnd < exceptionStart)
								{
									//we are past start of this year and before the end of exception in the next Calendar year
									//this exception applies!
									return "<ul><li>" + structuredData.operatingHours[x].exceptions[y].name + " (" + theMonths[exceptionStart.getMonth()] + " " + exceptionStart.getDate() + " - " + theMonths[exceptionEnd.getMonth()] + " " + exceptionEnd.getDate() + "):<ul>" + judgeSeason(structuredData.operatingHours[x].exceptions[y].schedule) + "</ul></li></ul>";
								}
								else
								{
									//We are past the exception end, which is later in the calendar year than the start. NO exception
									continue;
								}
							}
						}
						else
						{
							//not past this year's start date
							//BUT! make sure we are affected by last year's start by checking if we are under the end of this year...
							if(exceptionStart > exceptionEnd && now <= exceptionEnd)
							{
								return "<ul><li>" + structuredData.operatingHours[x].exceptions[y].name + " (" + theMonths[exceptionStart.getMonth()] + " " + exceptionStart.getDate() + " - " + theMonths[exceptionEnd.getMonth()] + " " + exceptionEnd.getDate() + "):<ul>" + judgeSeason(structuredData.operatingHours[x].exceptions[y].schedule) + "</ul></li></ul>";
							}
							else
							{
								//NO. Not past the start date of this year's exception. exception does NOT apply
								continue;
							}
						}
					}
				}
			}
			//If we got here, we exhausted all the exceptions and found nothing to override. so get the normal hours.
			//console.log("Normal Hours")
			return "<ul><li>Standard Hours:<ul>" + judgeSeason(structuredData.operatingHours[x].hours) + "</ul></li></ul>";
		}
	}
}
function getSeasonHours(structuredData, scheduleID)
{
	var allSeasons = ""
	for(var x = 0; x < structuredData.operatingHours.length; x++)
	{
		//first find correct site
		if(structuredData.operatingHours[x].operatingScheduleID == scheduleID)
		{
			//normal hours first
			allSeasons = "<ul>";
			allSeasons += "<li>Standard Hours:";
			allSeasons += "<ul>" + judgeSeason(structuredData.operatingHours[x].hours) + "</ul>";
			allSeasons += "</li>";
			var exceptions = [];
			var holidayExceptions = [];
			if(structuredData.operatingHours[x].exceptions)
			{
				for(var z = 0; z < structuredData.operatingHours[x].exceptions.length; z++)
				{
					if(structuredData.operatingHours[x].exceptions[z].holiday_start != '' || structuredData.operatingHours[x].exceptions[z].date_start != '')
					{
						var exceptionStart = new Date(structuredData.operatingHours[x].exceptions[z].date_start + " " + now.getFullYear())
						if(structuredData.operatingHours[x].exceptions[z].holiday_start != '')
						{
							exceptionStart = getHoliday(structuredData.operatingHours[x].exceptions[z].holiday_start, now.getFullYear());
						}
						var exceptionEnd = new Date(structuredData.operatingHours[x].exceptions[z].date_end + " " + now.getFullYear())
						if(structuredData.operatingHours[x].exceptions[z].holiday_end != '')
						{
							exceptionEnd = getHoliday(structuredData.operatingHours[x].exceptions[z].holiday_end, now.getFullYear());
						}
						var exceptionText = "<li>";
						if(structuredData.operatingHours[x].exceptions[z].holiday_start == structuredData.operatingHours[x].exceptions[z].holiday_end && structuredData.operatingHours[x].exceptions[z].holiday_start != '')
						{
							exceptionText += structuredData.operatingHours[x].exceptions[z].name + ":";
							exceptionText += "<ul>" + judgeSeason(structuredData.operatingHours[x].exceptions[z].schedule) + "</ul>"
							exceptionText += "</li>";
							holidayExceptions.push({start:exceptionStart,name:structuredData.operatingHours[x].exceptions[z].name,text:exceptionText})
						}
						else
						{
							exceptionText += structuredData.operatingHours[x].exceptions[z].name + " (";
							//start is a holiday but not a single day holiday exception(above if statement)
							if(structuredData.operatingHours[x].exceptions[z].holiday_start != '')
							{
								exceptionText += structuredData.operatingHours[x].exceptions[z].holiday_start;
							}
							else
							{
								exceptionText += theMonths[exceptionStart.getMonth()] + " " + exceptionStart.getDate();
							}
							//end is a holiday but not a single day holiday exception
							if(structuredData.operatingHours[x].exceptions[z].holiday_end != '')
							{
								exceptionText +=  " - " + structuredData.operatingHours[x].exceptions[z].holiday_end + "):";
							}
							else
							{
								if(exceptionStart.toISOString() != exceptionEnd.toISOString())
								{
									exceptionText +=  " - " + theMonths[exceptionEnd.getMonth()] + " " + exceptionEnd.getDate() + "):";
								}
								else
								{
									exceptionText += "):";
								}
							}
							exceptionText += "<ul>" + judgeSeason(structuredData.operatingHours[x].exceptions[z].schedule) + "</ul>"
							exceptionText += "</li>";
							exceptions.push({start:exceptionStart,name:structuredData.operatingHours[x].exceptions[z].name,text:exceptionText})
						}
					}
				}
			}
			sortExceptions(exceptions)
			for(var z = 0; z < exceptions.length; z++)
			{
				allSeasons += exceptions[z].text;
			}
			sortExceptions(holidayExceptions)
			for(var z = 0; z < holidayExceptions.length; z++)
			{
				allSeasons += holidayExceptions[z].text;
			}
			allSeasons += "</ul>";
			return allSeasons;
		}
	}
	return false;
}

function sortExceptions(ex)
{
	for(var x = 1; x < ex.length; x++)
	{
		if(ex[x-1].start > ex[x].start)
		{
			var first = ex[x-1]
			var second = ex[x]
			ex.splice(x, 1, first);
			ex.splice(x-1, 1, second);
			sortExceptions(ex)
		}
	}
	return ex;
}

function getCurrentHours(structuredData, scheduleID){
	var hoursString = ''
	//FIGURE OUT VALID OPERATING HOURS
	hoursLoop:
	{
		for(var x = 0; x < structuredData.operatingHours.length; x++)
		{
			//first find correct site
			if(structuredData.operatingHours[x].operatingScheduleID == scheduleID)
			{
				//we have the correct site based on the database IstructuredData.
				//console.log(structuredData.operatingHours[x].name)
				//now to adjudge if exceptions apply


				//EXCEPTIONS
				if(structuredData.operatingHours[x].exceptions)
				{
					for(var y = 0; y < structuredData.operatingHours[x].exceptions.length; y++)
					{
						//console.log("Testing exception " + structuredData.operatingHours[x].exceptions[y].name)
						//explicit holidays have precedence.
						if(todayIsHoliday && todayIsHoliday == structuredData.operatingHours[x].exceptions[y].holiday_start && todayIsHoliday == structuredData.operatingHours[x].exceptions[y].holiday_end)
						{
							//Single day holiday exception hit
							//get day of week schedule.
							for(var z = 0; z < structuredData.operatingHours[x].exceptions[y].schedule.length; z++)
							{
								if(structuredData.operatingHours[x].exceptions[y].schedule[z].dayOfWeek == today)
								{
									hoursString = judgeHours(structuredData.operatingHours[x].exceptions[y].schedule[z])
									return hoursString
								}
							}
						}
						//other exceptions, last in wins.

						//first clean up the variability between holiday or explicit date start/ends
						var exceptionStart = ""
						if(structuredData.operatingHours[x].exceptions[y].holiday_start != "")
						{
							exceptionStart = getHoliday(structuredData.operatingHours[x].exceptions[y].holiday_start, now.getFullYear())
						}
						else
						{
							exceptionStart = new Date(structuredData.operatingHours[x].exceptions[y].date_start + " " + now.getFullYear())
						}

						var exceptionEnd = ""
						if(structuredData.operatingHours[x].exceptions[y].holiday_end != "")
						{
							exceptionEnd = getHoliday(structuredData.operatingHours[x].exceptions[y].holiday_end, now.getFullYear())
						}
						else
						{
							exceptionEnd = new Date(structuredData.operatingHours[x].exceptions[y].date_end + " " + now.getFullYear())
						}


						if
						(	//if start is a holiday, skip ones where they end with the same holiday. That's above.
							//so accept ones where a holiday start exists and isn't the same holiday as the end
							(
								structuredData.operatingHours[x].exceptions[y].holiday_start != ""
								&&
								structuredData.operatingHours[x].exceptions[y].holiday_start != structuredData.operatingHours[x].exceptions[y].holiday_end
							)
							||
							//and accept all date explicit exceptions.
							structuredData.operatingHours[x].exceptions[y].date_start != ""
						){
							//are we past the start date of exception
							if(now >= exceptionStart)
							{
								//yes we are past the start of exception
								//so look at the exception enstructuredData. Are we under the current calendar year's cutoff?

								if(now <= exceptionEnd)
								{
									//yes we are within the end of the exception this year.
									//EXCEPTION APPLIES!
									for(var z = 0; z < structuredData.operatingHours[x].exceptions[y].schedule.length; z++)
									{
										if(structuredData.operatingHours[x].exceptions[y].schedule[z].dayOfWeek == today)
										{
											hoursString = judgeHours(structuredData.operatingHours[x].exceptions[y].schedule[z])
											//console.log("Exception " + structuredData.operatingHours[x].exceptions[y].name + " in effect within year" )
											return hoursString
										}
									}
								}
								else
								{
									//no we are past the exception enstructuredData. but was the exception end before the exception start?
									//if exception end is lower than start, we need to look to next year as the true end date
									if(exceptionEnd < exceptionStart)
									{
										//we are past start of this year and before the end of exception in the next Calendar year
										//this exception applies!
										for(var z = 0; z < structuredData.operatingHours[x].exceptions[y].schedule.length; z++)
										{
											if(structuredData.operatingHours[x].exceptions[y].schedule[z].dayOfWeek == today)
											{
												hoursString = judgeHours(structuredData.operatingHours[x].exceptions[y].schedule[z])
												//console.log("Exception " + structuredData.operatingHours[x].exceptions[y].name + " in effect - next year end date" )
												return hoursString
											}
										}
									}
									else
									{
										//We are past the exception end, which is later in the calendar year than the start. NO exception
										continue;
									}
								}
							}
							else
							{
								//not past this year's start date
								//BUT! make sure we are affected by last year's start by checking if we are under the end of this year...
								if(exceptionStart > exceptionEnd && now <= exceptionEnd)
								{
									//yes we are before the end of the exception this year.

									for(var z = 0; z < structuredData.operatingHours[x].exceptions[y].schedule.length; z++)
									{
										if(structuredData.operatingHours[x].exceptions[y].schedule[z].dayOfWeek == today)
										{
											hoursString = judgeHours(structuredData.operatingHours[x].exceptions[y].schedule[z])
											//console.log("Exception " + structuredData.operatingHours[x].exceptions[y].name + " in effect from last year start date" )
											return hoursString
										}
									}
								}
								else
								{
									//NO. Not past the start date of this year's exception. exception does NOT apply
									continue;
								}
							}
						}
					}
				}
				//If we got here, we exhausted all the exceptions and found nothing to override. so get the normal hours.
				//console.log("Normal Hours")
				for(var y = 0; y < structuredData.operatingHours[x].hours.length; y++)
				{
					if(structuredData.operatingHours[x].hours[y].dayOfWeek == today)
					{
						hoursString = judgeHours(structuredData.operatingHours[x].hours[y])
						return hoursString
					}
				}
			}
		}
	}
	return false
}

function judgeHours(schedule){
	var returnString = ""
	if(schedule.is_closed)
	{
		returnString = "Closed."
	}
	else
	{
		returnString = "Open "
		if(schedule.sunrise_open)
		{
			returnString += "Sunrise "
		}
		else
		{
			returnString += schedule.time_open + " "
		}
		if(schedule.sunset_close)
		{
			returnString += "- Sunset."
		}
		else
		{
			returnString += "- " + schedule.time_close + "."
		}
	}
	return returnString
}
/*
function judgeSeason(schedule){
	var seasonString = ""
	dailyHours = {};
	for(var y = 0; y < schedule.length; y++)
	{
		dailyHours[daysOfWeek[schedule[y].dayOfWeek - 1]] = judgeHours(schedule[y]); //offset day of week by 1 since 1 in API is sunday, but otherwise it's 0
	}
	compressedHours = [{hours:dailyHours["Sunday"],days:[0]}]
	for(var y = 1; y < daysOfWeek.length; y++)
	{
		var match = false;
		for(var z = 0; z < compressedHours.length; z++)
		{
			if(dailyHours[daysOfWeek[y]] == compressedHours[z].hours)
			{
				compressedHours[z].days.push(y);
				match = true;
			}
		}
		if(!match)
		{
			compressedHours.push({hours:dailyHours[daysOfWeek[y]],days:[y]})
		}
	}
	console.log(compressedHours)



	for(var y = 0; y < compressedHours.length; y++)
	{
		var referenceDay = compressedHours[y].days[0];//first day in series as a number
		var dayRangeStr = "";
		for(var z = 1; z < compressedHours[y].days.length; z++)
		{
			//if the next day is not in order (i.e. Monday is missing so Tuesday is after Sunday...)
			if(compressedHours[y].days[z] != )
			{

				if(z - referenceDay == 1)//one day sequence
				{
					dayRange += compressedHours[y].days[referenceDay] + ", ";
				}
				else
				{
					dayRange += compressedHours[y].days[referenceDay] + " - " + compressedHours[y].days[z-1];
				}
				referenceDay = z;
				//dayRange += compressedHours[y].days[referenceDay]
			}
			else
			{

			}
		}
		console.log(dayRange)
	}
}
*/
function judgeSeason(schedule){
	var seasonString = ""
	dailyHours = {};
	for(var y = 0; y < schedule.length; y++)
	{
		dailyHours[daysOfWeek[schedule[y].dayOfWeek - 1]] = judgeHours(schedule[y]); //offset day of week by 1 since 1 in API is sunday, but otherwise it's 0
	}
	referenceDay = 0;
	for(var y = 1; y < daysOfWeek.length; y++)
	{
		if(dailyHours[daysOfWeek[referenceDay]] == dailyHours[daysOfWeek[y]])
		{
			//if hours are the same for the starting referenceDay and next day of week in a range, continue on until things are different.
			//if the whole week goes by, then we don't need to differentiate weekday hours.
			if(referenceDay == 0 && y == 6)
			{
				seasonString += "<li>" + dailyHours[daysOfWeek[y]] + "</li>";
			}
			if(referenceDay > 0 && y == 6)
			{
				seasonString += "<li>" + daysOfWeek[referenceDay] + " - " + daysOfWeek[y] + ": " + dailyHours[daysOfWeek[referenceDay]] + "</li>";
			}
		}
		else
		{
			//so now hours are different.
			//first thing, we should write the previous range down before moving on.

			//if the range was just one day, write it singularly
			if(y-1 == referenceDay)
			{
				seasonString += "<li>" + daysOfWeek[referenceDay] + ": " + dailyHours[daysOfWeek[referenceDay]] + "</li>";
			}
			//if a range, then write it with a range
			else
			{
				seasonString += "<li>" + daysOfWeek[referenceDay] + " - " + daysOfWeek[y-1] + ": " + dailyHours[daysOfWeek[referenceDay]] + "</li>";
			}
			//now our reference has changed because we are looking at a new range and we should move on.
			referenceDay = y;
			//And if this is the last day of the week (saturday) and it is a single instance relative to friday or earlier, just write and be done.
			if(y==6)
			{
				seasonString += "<li>" + daysOfWeek[referenceDay] + ": " + dailyHours[daysOfWeek[referenceDay]] + "</li>";
			}
		}
	}
	return seasonString;
}
