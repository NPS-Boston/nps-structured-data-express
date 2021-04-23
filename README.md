# nps-structured-data-express
Easy-to-use JS libraries that make grabbing NPS structured data in user-friendly ways. Works either internally (default park .json files) or externally (via NPS data API)

## For use within nps.gov, [see documentation here](https://www.nps.gov/features/bost/structured_data/)
The library is already loaded into the nps.gov CDN and can load the .json files which already contain park data and park alerts without violating CORS policies.
Source code is also mantained in the directory **internal_structured_data_js**

## For use outside nps.gov
The library works in much the same way when it gets down to marking up a webpage. The biggest exception is that you will need to either make api calls with your own key directly, or rely on some intermediary server-side code to fetch and/or cache that data for you.
In short, you will need to configure the external library with some kind of endpoint that presents the data in the same manner.
Source code for this methodology will be mantained in the directory **external_structured_data_js**

### Working with structured data externally via the NPS API
[Get Started](https://www.nps.gov/subjects/developer/get-started.htm) with the nps.gov developer page and it is always a good idea to be familiar with the [documentation of the API] (https://www.nps.gov/subjects/developer/api-documentation.htm).
This library specifically works with the **parks** and **alerts** endpoints of the API

