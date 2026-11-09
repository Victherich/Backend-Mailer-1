// import { NextResponse } from 'next/server';

// const CPANEL_BACKEND_URL = 'https://elexdonpay.com'; // Your live cPanel backend base URL

// async function handleRequest(request, { params }) {
//   try {
//     // Await params if required by your Next.js version, or access directly depending on SDK
//     const resolvedParams = await params;
//     const pathSegments = resolvedParams?.path || [];
//     const endpointPath = pathSegments.join('/');
    
//     // Extract search/query parameters from the incoming request
//     const urlObj = new URL(request.url);
//     const queryString = urlObj.search;
    
//     const targetUrl = `${CPANEL_BACKEND_URL}/api_connect/${endpointPath}${queryString}`;

//     // Collect headers from the incoming request to forward (e.g., Authorization tokens)
//     const headers = new Headers();
//     request.headers.forEach((value, key) => {
//       // Skip host headers to avoid domain mismatch errors on cPanel
//       if (key !== 'host' && key !== 'connection') {
//         headers.set(key, value);
//       }
//     });

//     // Prepare fetch options
//     const options = {
//       method: request.method,
//       headers: headers,
//     };

//     // If it's a POST, PUT, or PATCH request, include the body
//     if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
//       const contentType = request.headers.get('content-type') || '';
//       if (contentType.includes('application/json')) {
//         options.body = JSON.stringify(await request.json());
//       } else {
//         options.body = await request.text();
//       }
//     }

//     // Forward the request to your cPanel backend
//     const cPanelResponse = await fetch(targetUrl, options);
    
//     // Read the response data from cPanel
//     const responseContentType = cPanelResponse.headers.get('content-type') || '';
//     let responseData;
    
//     if (responseContentType.includes('application/json')) {
//       responseData = await cPanelResponse.json();
//     } else {
//       responseData = await cPanelResponse.text();
//     }

//     // Return the response back to your React Native app
//     return NextResponse.json(responseData, {
//       status: cPanelResponse.status,
//       headers: {
//         'Content-Type': responseContentType,
//       },
//     });

//   } catch (error) {
//     console.error('API Proxy Error:', error);
//     return NextResponse.json(
//       { success: false, message: 'Proxy server error', error: error.message },
//       { status: 500 }
//     );
//   }
// }

// export { handleRequest as GET, handleRequest as POST, handleRequest as PUT, handleRequest as DELETE };





import { NextResponse } from 'next/server';

const CPANEL_BACKEND_URL = 'https://elexdonpay.com';

async function handleRequest(request, { params }) {
  // Handle CORS Preflight request from web browsers
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    const resolvedParams = await params;
    const pathSegments = resolvedParams?.path || [];
    const endpointPath = pathSegments.join('/');
    
    const urlObj = new URL(request.url);
    const targetUrl = `${CPANEL_BACKEND_URL}/api_connect/${endpointPath}${urlObj.search}`;

    const headers = new Headers();
    request.headers.forEach((value, key) => {
      if (key !== 'host' && key !== 'connection') {
        headers.set(key, value);
      }
    });

    const options = {
      method: request.method,
      headers: headers,
    };

    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      const contentType = request.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        options.body = JSON.stringify(await request.json());
      } else {
        options.body = await request.text();
      }
    }

    const cPanelResponse = await fetch(targetUrl, options);
    const responseContentType = cPanelResponse.headers.get('content-type') || '';
    let responseData;
    
    if (responseContentType.includes('application/json')) {
      responseData = await cPanelResponse.json();
    } else {
      responseData = await cPanelResponse.text();
    }

    // Return response with CORS headers enabled
    return NextResponse.json(responseData, {
      status: cPanelResponse.status,
      headers: {
        'Content-Type': responseContentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });

  } catch (error) {
    console.error('API Proxy Error:', error);
    return NextResponse.json(
      { success: false, message: 'Proxy server error', error: error.message },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
}

export { handleRequest as GET, handleRequest as POST, handleRequest as PUT, handleRequest as DELETE, handleRequest as OPTIONS };