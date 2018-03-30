function executeQueries(){

	var token = JSON.parse(Cookies.get(myCookie)).token;

	var jqxhr = $.ajax({
		url : membersUrl,
		method: "GET",
		xhrFields: {
			withCredentials: true
		},
		beforeSend : function (xhrObj) {
			$(".loading-modal").show();
			xhrObj.setRequestHeader("Content-Type", "application/json");
			xhrObj.setRequestHeader("X-API-KEY", token);
		}
	})
	.done(function (result, status, xhr) {

		info = result;

		// function that belongs to the common.js script.
		setQuantities();

		populateViolationsTable();

		populateAllObjectsTable();
	})
	.fail(function (error) {
		//alert("Unexpected error: " + JSON.stringify (error));
	})
	.always(function () {
		$(".loading-modal").hide();
	});
}