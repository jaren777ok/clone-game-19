import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DriveUploadResponse {
  success: boolean;
  imageUrls: string[];
  videoUrls: string[];
  error?: string;
}

async function getAccessToken(): Promise<string> {
  const clientId = '898665075367-jveciam3kqsnc46lnrf47bnbn7iq709n.apps.googleusercontent.com';
  const clientSecret = Deno.env.get('GOOGLE_DRIVE_CLIENT_SECRET');
  
  if (!clientSecret) {
    throw new Error('Google Drive Client Secret not configured');
  }

  // For server-to-server authentication, we need to use service account
  // For now, we'll use a simple approach with user OAuth token
  // In production, you should implement proper OAuth flow
  throw new Error('OAuth flow needs to be implemented in frontend');
}

async function uploadFileToGoogleDrive(file: File, accessToken: string, fileName: string): Promise<string> {
  const metadata = {
    name: fileName,
    parents: ['your-folder-id'], // You can specify a folder ID or omit for root
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    body: form,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload file: ${response.statusText}`);
  }

  const result = await response.json();
  
  // Get the webContentLink
  const fileResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${result.id}?fields=webContentLink`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!fileResponse.ok) {
    throw new Error(`Failed to get file details: ${fileResponse.statusText}`);
  }

  const fileData = await fileResponse.json();
  return fileData.webContentLink;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const accessToken = formData.get('accessToken') as string;
    
    if (!accessToken) {
      return new Response(
        JSON.stringify({ success: false, error: 'Access token required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const imageUrls: string[] = [];
    const videoUrls: string[] = [];

    console.log('Starting Google Drive upload process...');

    // Upload images (image_0 to image_13)
    for (let i = 0; i < 14; i++) {
      const imageFile = formData.get(`image_${i}`) as File;
      if (imageFile) {
        console.log(`Uploading image ${i + 1}/14...`);
        const webContentLink = await uploadFileToGoogleDrive(
          imageFile,
          accessToken,
          `image_${i}_${Date.now()}.${imageFile.name.split('.').pop()}`
        );
        imageUrls.push(webContentLink);
        console.log(`Image ${i + 1} uploaded successfully`);
      }
    }

    // Upload videos (video1 to video5)
    for (let i = 1; i <= 5; i++) {
      const videoFile = formData.get(`video${i}`) as File;
      if (videoFile) {
        console.log(`Uploading video ${i}/5...`);
        const webContentLink = await uploadFileToGoogleDrive(
          videoFile,
          accessToken,
          `video${i}_${Date.now()}.${videoFile.name.split('.').pop()}`
        );
        videoUrls.push(webContentLink);
        console.log(`Video ${i} uploaded successfully`);
      }
    }

    console.log(`Upload completed: ${imageUrls.length} images, ${videoUrls.length} videos`);

    const response: DriveUploadResponse = {
      success: true,
      imageUrls,
      videoUrls,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in google-drive-upload function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        imageUrls: [],
        videoUrls: []
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});