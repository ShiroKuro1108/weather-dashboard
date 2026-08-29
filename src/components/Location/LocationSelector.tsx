import { Autocomplete, TextField, Box, Typography } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import type { FlightLocation } from "../../types/weather";

interface Props {
  locations: FlightLocation[];
  selected: FlightLocation;
  onChange: (loc: FlightLocation) => void;
}

export default function LocationSelector({ locations, selected, onChange }: Props) {
  return (
    <Autocomplete
      value={selected}
      onChange={(_, value) => {
        if (value) onChange(value);
      }}
      options={locations}
      groupBy={(option) => option.district}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      renderOption={(props, option) => {
        const { key, ...rest } = props;
        return (
          <Box
            component="li"
            key={key}
            {...rest}
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <LocationOnIcon
              fontSize="small"
              sx={{
                color: option.isDistrictCenter ? "primary.main" : "text.secondary",
                fontSize: option.isDistrictCenter ? 18 : 14,
              }}
            />
            <Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: option.isDistrictCenter ? 700 : 400 }}
              >
                {option.name}
              </Typography>
              {option.isDistrictCenter && (
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {option.lat.toFixed(4)}°N, {option.lon.toFixed(4)}°E
                </Typography>
              )}
            </Box>
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Địa điểm bay"
          placeholder="Tìm huyện hoặc xã..."
          size="small"
        />
      )}
      sx={{ minWidth: 280 }}
    />
  );
}
