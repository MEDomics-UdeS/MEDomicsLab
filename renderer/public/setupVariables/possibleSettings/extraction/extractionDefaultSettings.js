const extractionDefaultSettings = {
  interpolation: {
    scale_non_text: [1, 1, 1],
    scale_text: [[1, 1, 1]],
    vol_interp: "linear",
    gl_round: [],
    roi_interp: "linear",
    roi_pv: 0.5,
  },
  filter: {
    filter_type: "mean",
    mean: {
      ndims: 3,
      orthogonal_rot: false,
      size: 5,
      padding: "symmetric",
      name_save: "mean_filter",
    },
    log: {
      ndims: 3,
      sigma: 1.5,
      orthogonal_rot: false,
      padding: "symmetric",
      name_save: "log_filter",
    },
    laws: {
      config: ["L3", "", ""],
      energy_distance: 7,
      rot_invariance: true,
      orthogonal_rot: false,
      energy_image: true,
      padding: "symmetric",
      name_save: "laws_filter",
    },
    gabor: {
      sigma: 5,
      lambda: 2,
      gamma: 1.5,
      theta: "Pi/8",
      rot_invariance: true,
      orthogonal_rot: true,
      padding: "symmetric",
      name_save: "gabor_filter",
    },
    wavelet: {
      ndims: 3,
      basis_function: "db3",
      subband: "LLH",
      level: 1,
      rot_invariance: true,
      padding: "symmetric",
      name_save: "wavelet_filter",
    },
  },
  re_segmentation: {
    range: [0, "inf"],
    outliers: "",
  },
  discretization: {
    IH: {
      type: "FBS",
      val: 25,
    },
    IVH: {
      type: "FBN",
      val: 10,
    },
    texture: {
      type: ["FBS"],
      val: [[25]],
    },
  },
};

export default extractionDefaultSettings;
