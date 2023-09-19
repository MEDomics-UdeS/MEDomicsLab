const extractionFeatures = {
  morph: {
    MEDimageName: "morph",
    associatedFeatures: {
      a_dens_aabb: "Area density aabb",
      a_dens_aee: "Area density aee",
      a_dens_conv_hull: "Area density convex hull",
      a_dens_mvee: "Area density mvee",
      a_dens_ombb: "Area density ombb",
      approx_vol: "Approximate volume",
      area: "Surface area",
      asphericity: "Asphericity",
      av: "Surface to volume ratio",
      com: "Centre of mass shift",
      comp_1: "Compactness 1",
      comp_2: "Compactness 2",
      diam: "Maximum 3d diameter",
      geary_c: "Geary's C measure",
      integ_int: "Integrated intensity",
      moran_i: "Moran's I index",
      pca_elongation: "Elongation",
      pca_flatness: "Flatness",
      pca_least: "Least axis length",
      pca_major: "Major axis length",
      pca_minor: "Minor axis length",
      sph_dispr: "Spherical disproportion",
      sphericity: "Sphericity",
      v_dens_aabb: "Volume density aabb",
      v_dens_aee: "Volume density aee",
      v_dens_conv_hull: "Volume density - convex hull",
      v_dens_mvee: "Volume density mvee",
      v_dens_ombb: "Volume density ombb",
      vol: "Volume"
    }
  },
  li: {
    MEDimageName: "local_intensity",
    associatedFeatures: {
      peak_global: "Global intensity peak",
      peak_local: "Local intensity peak"
    }
  },
  is_stat: {
    MEDimageName: "stats",
    associatedFeatures: {
      cov: "Coefficient of variation",
      energy: "Energy",
      iqrange: "Interquartile range",
      kurt: "Kurtosis",
      mad: "Mean absolute deviation",
      max: "Maximum grey level",
      mean: "Mean",
      medad: "Median absolute deviation",
      median: "Median",
      min: "Minimum grey level",
      p10: "Score at 10th percentile",
      p90: "Score at 90th percentile",
      qcod: "Quartile coefficient of dispersion",
      range: "Range of values (maximum - minimum)",
      rmad: "Robust mean absolute deviation",
      rms: "Root mean square",
      skewness: "Sample skewness",
      var: "Statistical variance"
    }
  },
  ih: {
    MEDimageName: "intensity_histogram",
    associatedFeatures: {
      cov: "Coefficient of variation",
      entropy: "Entropy",
      iqrange: "Interquartile range",
      kurt: "Kurtosis",
      mad: "Mean absolute deviation",
      max: "Maximum grey level",
      max_grad: "Maximum histogram gradient",
      max_grad_gl: "Maximum histogram gradient grey level",
      mean: "Mean",
      medad: "Median absolute deviation",
      median: "Median",
      min: "Minimum grey level",
      min_grad: "Minimum histogram gradient",
      min_grad_gl: "Minimum histogram gradient grey level",
      mode: "Mode",
      p10: "10th percentile",
      p90: "90th percentile",
      qcod: "Quartile coefficient of dispersion",
      range: "Range",
      rmad: "Robust mean absolute deviation",
      skewness: "Skewness",
      uniformity: "Uniformity",
      var: "Variance"
    }
  },
  ivh: {
    MEDimageName: "int_vol_hist",
    associatedFeatures: {
      i10: "Intensity at volume fraction 10",
      i10_minus_i90: "Intensity at volume fraction difference",
      i90: "Intensity at volume fraction 90",
      v10: "Volume at intensity fraction 10",
      v10_minus_v90: "Volume at intensity fraction difference",
      v90: "Volume at intensity fraction 90"
    }
  },
  glcm: {
    MEDimageName: "glcm",
    associatedFeatures: {
      auto_corr: "Autocorrelation",
      clust_prom: "Cluster prominence",
      clust_shade: "Cluster shade",
      clust_tend: "Cluster tendency",
      contrast: "Contrast",
      corr: "Correlation",
      diff_avg: "Difference average",
      diff_entr: "Difference entropy",
      diff_var: "Difference variance",
      dissimilarity: "Dissimilarity",
      energy: "Angular second moment",
      info_corr1: "Information correlation 1",
      info_corr2: "Information correlation 2",
      inv_diff: "Inverse difference",
      inv_diff_mom: "Inverse difference moment",
      inv_diff_mom_norm: "Inverse difference moment normalized",
      inv_diff_norm: "Inverse difference normalized",
      inv_var: "Inverse variance",
      joint_avg: "Joint average",
      joint_entr: "Joint entropy",
      joint_max: "Joint maximum",
      joint_var: "Joint variance",
      sum_avg: "Sum average",
      sum_entr: "Sum entropy",
      sum_var: "Sum variance"
    }
  },
  gldzm: {
    MEDimageName: "gldzm",
    associatedFeatures: {
      gl_var: "Grey level variance",
      glnu: "Grey level non-uniformity",
      glnu_norm: "Grey level non-uniformity normalised",
      hgze: "High grey level zone emphasis",
      lde: "Large distance emphasis",
      ldhge: "Large distance high grey level emphasis",
      ldlge: "Large distance low grey level emphasis",
      lgze: "Low grey level zone emphasis",
      sde: "Small distance emphasis",
      sdhge: "Small distance high grey level emphasis",
      sdlge: "Small distance low grey level emphasis",
      z_perc: "Zone percentage",
      zd_entr: "Zone distance entropy",
      zd_var: "Zone distance variance",
      zdnu: "Zone distance non-uniformity",
      zdnu_norm: "Zone distance non-uniformity normalised"
    }
  },
  glrlm: {
    MEDimageName: "glrlm",
    associatedFeatures: {
      gl_var: "Grey level variance",
      glnu: "Grey level non-uniformity",
      glnu_norm: "Grey level non-uniformity normalised",
      hgre: "High grey level run emphasis",
      lgre: "Low grey level run emphasis",
      lre: "Long runs emphasis",
      lrhge: "Long run high grey level emphasis",
      lrlge: "Long run low grey level emphasis",
      r_perc: "Run percentage",
      rl_entr: "Run entropy",
      rl_var: "Run length variance",
      rlnu: "Run length non-uniformity",
      rlnu_norm: "Run length non-uniformity normalised",
      sre: "Short runs emphasis",
      srhge: "Short run high grey level emphasis",
      srlge: "Short run low grey level emphasis"
    }
  },
  glszm: {
    MEDimageName: "glszm",
    associatedFeatures: {
      gl_var: "Grey level variance",
      glnu: "Grey level non-uniformity",
      glnu_norm: "Grey level non-uniformity normalised",
      hgze: "High grey level zone emphasis",
      lgze: "Low grey level zone emphasis",
      lze: "Large zone emphasis",
      lzhge: "Large zone high grey level emphasis",
      lzlge: "Large zone low grey level emphasis",
      sze: "Small zone emphasis",
      szhge: "Small zone high grey level emphasis",
      szlge: "Small zone low grey level emphasis",
      z_perc: "Zone percentage",
      zs_entr: "Zone size entropy",
      zs_var: "Zone size variance",
      zsnu: "Zone size non-uniformity",
      zsnu_norm: "Zone size non-uniformity normalised"
    }
  },
  ngldm: {
    MEDimageName: "ngldm",
    associatedFeatures: {
      dc_energy: "Dependence count energy",
      dc_entr: "Dependence count entropy",
      dc_var: "Dependence count variance",
      dcnu: "Dependence count non-uniformity",
      dcnu_norm: "Dependence count non-uniformity normalised",
      gl_var: "Grey level variance",
      glnu: "Grey level non-uniformity",
      glnu_norm: "Grey level non-uniformity normalised",
      hde: "High dependence emphasis",
      hdhge: "High dependence high grey level emphasis",
      hdlge: "High dependence low grey level emphasis",
      hgce: "High grey level count emphasis",
      lde: "Low dependence emphasis",
      ldhge: "Low dependence high grey level emphasis",
      ldlge: "Low dependence low grey level emphasis",
      lgce: "Low grey level count emphasis"
    }
  },
  ngtdm: {
    MEDimageName: "ngtdm",
    associatedFeatures: {
      busyness: "Busyness",
      coarseness: "Coarseness",
      complexity: "Complexity",
      contrast: "Contrast",
      strength: "Strength"
    }
  }
}

export default extractionFeatures
