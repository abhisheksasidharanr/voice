import React from 'react';

function Registration({ data }) {
  return (
    <>
      
        <div className="text-white text-sm">
          <div className="p-6">
          <div className="flex mb-5">
              <div className="w-[30%]">National Id</div>
              <div className="w-[70%]">
                <div className="border border-[#474545] px-2 py-1 min-h-8">
                  {data?.national_id}
                </div>
              </div>
            </div>
            <div className="flex mb-5">
              <div className="w-[30%]">Name</div>
              <div className="w-[70%]">
                <div className="border border-[#474545] px-2 py-1 min-h-8">
                  {data?.name}
                </div>
              </div>
            </div>
            
            <div className="flex mb-5">
              <div className="w-[30%]">State</div>
              <div className="w-[70%]">
                <div className="border border-[#474545] px-2 py-1 min-h-8">
                  {data?.state}
                </div>
              </div>
            </div>
            <div className="flex mb-5">
              <div className="w-[30%]">Crop</div>
              <div className="w-[70%]">
                <div className="border border-[#474545] px-2 py-1 min-h-8">
                  {data?.crop}
                </div>
              </div>
            </div>
            <div className="flex mb-5">
              <div className="w-[30%]">Yield Quantity</div>
              <div className="w-[70%]">
                <div className="border border-[#474545] px-2 py-1 min-h-8">
                  
                  {data?.yield_qty} {data?.yield_qty?'tons':''}
                </div>
              </div>
            </div>
            {data?.yield_qty &&
              <div className="flex mb-5">
                <div className="w-[30%]">EUDR Status</div>
                <div className="w-[70%]">
                  <div className="border border-[#474545] px-2 py-1 min-h-8">
                    
                    {data?.eudr_status}
                  </div>
                </div>
              </div>
            }

          </div>
        </div>
      
    </>
  );
}

export default Registration;
