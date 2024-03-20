const defaultBatchSettings = {
    pre_radiomics_checks : {
        path_data : "",
        wildcards_dimensions : [
        "Glioma*.MRscan.npy"
        ],
        path_csv : "",
        wildcards_window : [
        "Glioma*.MRscan.npy"
        ],
        path_save_checks : ""
    },
    n_batch : 16,
    roi_type_labels : [
        "GTV"
    ],
    roi_types : [
        "GTVp"
    ],
    imParamMR : {
        box_string: "box10",
        interp : {
        scale_non_text : [2, 2, 3],
        scale_text : [[2, 2, 3]],
        vol_interp : "linear",
        gl_round : [],
        roi_interp : "linear",
        roi_pv : 0.5
        },
        reSeg : {
        range : [-500, "inf"],
        outliers : ""
        },
        discretisation : {
        IH : {
            type : "FBS",
            val : 25
        },
        IVH : {
    
        },
        texture : {
            type : ["FBS"],
            val : [[25]]
        }
        },
        glcm : {
            dist_correction : "Chebyshev",
            merge_method : "vol_merge"
        },
        glrlm : {
            dist_correction : false,
            merge_method : "vol_merge"
        },
        ngtdm : {
            dist_correction : false
        },
        filter_type: "",
        intensity_type : ""
        },
    imParamCT : {
        interp : {
        scale_non_text : [2, 2, 2],
        scale_text : [[2, 2, 2]],
        vol_interp : "linear",
        gl_round : 1,
        roi_interp : "linear",
        roi_pv : 0.5
        },
        reSeg : {
        range : [-1000,400],
        outliers : ""
        },
        discretisation : {
        IH : {
            type : "FBS",
            val : 25
        },
        IVH : {
            type : "FBS",
            val : 2.5
        },
        texture : {
            type : ["FBS"],
            val : [[25]]
        }
        },
        glcm : {
            dist_correction : false,
            merge_method : "vol_merge"
        },
        glrlm : {
            dist_correction : false,
            merge_method : "vol_merge"
        },
        ngtdm : {
            dist_correction : false
        },
        filter_type : "",
        intensity_type : ""
        },
    imParamPET : {
        compute_suv_map : true,
        interp :  {
            scale_non_text : [4, 4, 4],
            scale_text : [[3, 3, 3], [4, 4, 4]],
            vol_interp : "linear",
            gl_round : [],
            roi_interp : "linear",
            roi_pv : 0.5
        },
        reSeg :  {
            range : [0, "inf"],
            outliers : ""
        },
        discretisation :  {
            IH : {
            type : "FBN",
            val : 64
            },
            IVH : {
            type : "FBS",
            val : 0.1
            },
            texture : {
            type : ["FBS", "FBSequal"],
            val : [[0.5, 1], [0.5, 1]]
            }
        },
        glcm : {
            dist_correction : "Chebyshev",
            merge_method : "vol_merge"
        },
        glrlm : {
            dist_correction : false,
            merge_method : "vol_merge"
        },
        ngtdm : {
            dist_correction : false
        },
        filter_type : "",
        intensity_type : ""
    },
    imParamFilter : {
        mean : {
        ndims : 3,
        size : 5,
        padding : "symmetric",
        orthogonal_rot : false,
        name_save : ""
        },
        log : {
        ndims : 3,
        sigma : 1.5,
        orthogonal_rot : false,
        padding : "symmetric",
        name_save : ""
        },
        laws : {
        config : ["L5", "E5", "E5"],
        energy_distance : 7,
        rot_invariance : true,
        orthogonal_rot : false,
        energy_image : true,
        padding : "symmetric",
        name_save : ""
        },
        gabor : {
        sigma : 5,
        lambda : 2,
        gamma : 1.5,
        theta : "Pi/8",
        rot_invariance : true,
        orthogonal_rot : true,
        padding : "symmetric",
        name_save : ""
        },
        wavelet : {
        ndims : 3,
        basis_function : "db3",
        subband : "LLH",
        level : 1,
        rot_invariance : true,
        padding : "symmetric",
        name_save : "Wavelet_db3_LLH"
        },
        textural : {
        family : "glcm",
        discretization : {
            type : "FBS",
            bn : null,
            bw : 1,
            adapted : false
        },
        size : 3,
        local : false,
        name_save : "glcm_global_fbs_1"
        }
    }
}

export default defaultBatchSettings;
